import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {admin} from "better-auth/plugins";
import {db} from "../db/drizzle";
import {account, session, user, verification} from "./auth-schema";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {sendEmail} from "../email";
import {verificationEmail} from "../email/templates/verification";
import {resetPasswordEmail} from "../email/templates/reset-password";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {user, session, account, verification},
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({user, url}) => {
            try {
                const {subject, html, text} = resetPasswordEmail({name: user.name, url});
                await sendEmail({to: user.email, subject, html, text});
            } catch (e) {
                console.error("Failed to send reset-password email:", e);
            }
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({user, url}) => {
            try {
                const {subject, html, text} = verificationEmail({name: user.name, url});
                await sendEmail({to: user.email, subject, html, text});
            } catch (e) {
                console.error("Failed to send verification email:", e);
            }
        },
    },
    session: {
        expiresIn: 60 * 60, // 1 hour of inactivity before session expires
        updateAge: 15 * 60, // auto-refresh session every 15 min if active
    },
    plugins: [admin()],
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