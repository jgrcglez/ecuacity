/**
 * Payphone payment gateway integration.
 *
 * Sandbox vs Production: controlled by the token/environment slider at
 * https://appdeveloper.payphonetodoesposible.com
 * ⚠️ NEVER put a production token here until ready to go live.
 */
const ENDPOINT = process.env.PAYPHONE_ENDPOINT ?? "https://pay.payphonetodoesposible.com";
const TOKEN = process.env.PAYPHONE_TOKEN ?? "";
const STORE_ID = process.env.PAYPHONE_STORE_ID ?? "";

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
  const body = {
    amount: req.amount,
    amountWithoutTax: req.amount, // simplified: no tax breakdown for now
    clientTransactionId: req.clientTransactionId,
    storeId: STORE_ID,
    currency: "USD",
    responseUrl: req.responseUrl,
    cancellationUrl: req.cancellationUrl ?? req.responseUrl,
    reference: req.reference ?? "Acceso Premium Ecuacity",
    email: req.email,
    phoneNumber: req.phoneNumber,
  };

  const res = await fetch(`${ENDPOINT}/api/button/Prepare`, {
    method: "POST",
    headers: {
      "Authorization": `bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Error al preparar pago");
  }

  return res.json();
}

/**
 * Step 2: Confirm a payment (must be called within 5 minutes of payment).
 * Call this from your responseUrl handler.
 */
export async function confirmPayment(req: ConfirmRequest): Promise<ConfirmResponse> {
  const res = await fetch(`${ENDPOINT}/api/button/V2/Confirm`, {
    method: "POST",
    headers: {
      "Authorization": `bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: req.id,
      clientTxId: req.clientTxId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Error al confirmar pago");
  }

  return res.json();
}
