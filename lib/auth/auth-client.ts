import {createAuthClient} from "better-auth/react";
import {adminClient, emailOTPClient} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
    plugins: [adminClient(), emailOTPClient()],
});

export const {signOut, useSession, updateUser} = authClient;
