/**
 * Payphone payment gateway integration.
 *
 * Sandbox vs Production: controlled by the token/environment slider at
 * https://appdeveloper.payphonetodoesposible.com
 * ⚠️ NEVER put a production token here until ready to go live.
 *
 * NOTE: Uses native https.request instead of fetch() because Node's built-in
 * fetch (undici) causes Payphone's ASP.NET backend to return HTTP 500
 * ("Runtime Error" HTML page) for unknown reasons. Native http/https works fine.
 */
import * as https from "node:https";
import type { IncomingMessage } from "node:http";
import { URL } from "node:url";

const ENDPOINT = process.env.PAYPHONE_ENDPOINT ?? "https://pay.payphonetodoesposible.com";
const TOKEN = process.env.PAYPHONE_TOKEN ?? "";
const STORE_ID = process.env.PAYPHONE_STORE_ID ?? "";

function postToPayphone(path: string, body: Record<string, unknown>): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, ENDPOINT);
    const data = JSON.stringify(body);

    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res: IncomingMessage) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf-8");

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(raw);
          } else {
            let parsed: Record<string, unknown>;
            try {
              parsed = JSON.parse(raw);
            } catch {
              parsed = { message: res.statusMessage ?? `HTTP ${res.statusCode}` };
            }
            const msg =
              typeof parsed.message === "string"
                ? parsed.message
                : `Payphone error ${res.statusCode}`;
            reject(new Error(msg));
          }
        });
      },
    );

    req.on("error", (err: Error) => reject(new Error(`Network error: ${err.message}`)));
    req.write(data);
    req.end();
  });
}

export interface PrepareRequest {
  amount: number;           // cents ($10.00 = 1000)
  clientTransactionId: string;
  responseUrl: string;
  cancellationUrl?: string;
  email?: string;
  phoneNumber?: string;
  reference?: string;
}

export interface PrepareResponse {
  paymentId: string;
  payWithPayPhone: string;
  payWithCard: string;
}

export interface ConfirmRequest {
  id: number;
  clientTxId: string;
}

export interface ConfirmResponse {
  statusCode: number;       // 3 = Approved, 2 = Canceled
  transactionStatus: string;
  transactionId: number;
  authorizationCode: string;
  cardBrand: string;
  cardType: string;
  amount: number;
  clientTransactionId: string;
  email?: string;
  phoneNumber?: string;
}

/**
 * Step 1: Prepare a payment session.
 * Returns two URLs: payWithPayPhone (wallet) and payWithCard.
 * Redirect the user to one of these.
 */
export async function preparePayment(req: PrepareRequest): Promise<PrepareResponse> {
  if (!TOKEN) {
    throw new Error("PAYPHONE_TOKEN no está configurado");
  }

  const body: Record<string, unknown> = {
    amount: req.amount,
    amountWithoutTax: req.amount,
    clientTransactionId: req.clientTransactionId,
    ...(STORE_ID ? { storeId: STORE_ID } : {}),
    currency: "USD",
    responseUrl: req.responseUrl,
    cancellationUrl: req.cancellationUrl ?? req.responseUrl,
    reference: (req.reference ?? "Acceso Premium Ecuacity").replace(/[^\x20-\x7E\s]/g, ""),
    email: req.email,
    phoneNumber: req.phoneNumber,
  };

  const raw = await postToPayphone("/api/button/Prepare", body);
  return JSON.parse(raw);
}

/**
 * Step 2: Confirm a payment (must be called within 5 minutes of payment).
 * Call this from your responseUrl handler.
 */
export async function confirmPayment(req: ConfirmRequest): Promise<ConfirmResponse> {
  if (!TOKEN) {
    throw new Error("PAYPHONE_TOKEN no está configurado");
  }

  const raw = await postToPayphone("/api/button/V2/Confirm", {
    id: req.id,
    clientTxId: req.clientTxId,
  });
  return JSON.parse(raw);
}
