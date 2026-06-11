import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {admin} from "better-auth/plugins";
import {db} from "../db/drizzle";
import {account, session, user as userTable, verification} from "./auth-schema";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {eq} from "drizzle-orm";
import {sendEmail} from "../email";
import {verificationEmail} from "../email/templates/verification";
import {resetPasswordEmail} from "../email/templates/reset-password";

const COOLDOWN_MS = 5 * 60 * 1000;

async function updateCooldown(userId: string, field: "verificationEmailSentAt" | "resetPasswordSentAt") {
    await db.update(userTable)
        .set({[field]: new Date()})
        .where(eq(userTable.id, userId));
}

async function isOnCooldown(user: {id: string}, field: "verificationEmailSentAt" | "resetPasswordSentAt"): Promise<boolean> {
    const [record] = await db.select({sentAt: userTable[field]})
        .from(userTable)
        .where(eq(userTable.id, user.id))
        .limit(1);
    if (!record?.sentAt) return false;
    return Date.now() - new Date(record.sentAt).getTime() < COOLDOWN_MS;
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {user: userTable, session, account, verification},
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({user, url}) => {
            if (await isOnCooldown(user, "resetPasswordSentAt")) return;
            try {
                const {subject, html, text} = resetPasswordEmail({name: user.name, url});
                await sendEmail({to: user.email, subject, html, text});
                await updateCooldown(user.id, "resetPasswordSentAt");
            } catch (e) {
                console.error("Failed to send reset-password email:", e);
            }
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({user, url}) => {
            if (await isOnCooldown(user, "verificationEmailSentAt")) return;
            try {
                const {subject, html, text} = verificationEmail({name: user.name, url});
                await sendEmail({to: user.email, subject, html, text});
                await updateCooldown(user.id, "verificationEmailSentAt");
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