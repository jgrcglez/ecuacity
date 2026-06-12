import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {admin} from "better-auth/plugins";
import {emailOTP} from "better-auth/plugins/email-otp";
import {db} from "../db/drizzle";
import {account, session, user as userTable, verification} from "./auth-schema";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {eq} from "drizzle-orm";
import {sendEmail} from "../email";
import {otpEmail} from "../email/templates/otp";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {user: userTable, session, account, verification},
    }),
    emailAndPassword: {
        enabled: false,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async () => {
            // Handled by emailOTP plugin
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days of inactivity before session expires
        updateAge: 30 * 60, // auto-refresh session every 30 min if active
    },
    plugins: [
        admin(),
        emailOTP({
            otpLength: 6,
            expiresIn: 300, // 5 minutes
            allowedAttempts: 3,
            sendVerificationOnSignUp: true,
            overrideDefaultEmailVerification: true,
            rateLimit: {
                window: 60, // 1 minute window
                max: 3, // max 3 OTP requests per window
            },
            sendVerificationOTP: async ({email, otp, type}) => {
                // Look up user name for a personalized email
                const [record] = await db.select({name: userTable.name})
                    .from(userTable)
                    .where(eq(userTable.email, email.toLowerCase()))
                    .limit(1);

                const name = record?.name ?? email.split("@")[0];
                const {subject, html, text} = otpEmail({name, otp, type});
                await sendEmail({to: email, subject, html, text});
            },
        }),
    ],
});

export async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function signOut() {
    const result = await auth.api.signOut({
        headers: await headers(),
    });

    if (result.success) {
        redirect("/sign-in");
    }
}
