import {NextRequest, NextResponse} from "next/server";
import {getSession} from "./lib/auth/auth";
import {getUserPlan} from "./lib/auth/subscription";
import {ADMIN_PAGES, USER_PAGES, AUTH_PAGES, PREMIUM_PAGES} from "./lib/config";

export default async function proxy(request: NextRequest) {
    const session = await getSession();

    const pathname = request.nextUrl.pathname;

    const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
    const isUserPage = USER_PAGES.some((page) => pathname.startsWith(page));
    const isAdminPage = ADMIN_PAGES.some((page) => pathname.startsWith(page));

    // Logged-in admins hitting auth pages → redirect to dashboard
    if (isAuthPage && session?.user && session.user.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Logged-in users hitting auth pages → redirect to student page
    if (isAuthPage && session?.user && session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/students", request.url));
    }

    // Unauthenticated users hitting admin pages → redirect to sign-in
    if (isAdminPage && !session?.user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Unauthenticated users hitting student pages → redirect to sign-in
    if (isUserPage && !session?.user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Non-admin users hitting admin pages → redirect to student page
    if (isAdminPage && session?.user && session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/students", request.url));
    }

    // Admin users hitting student pages → redirect to dashboard
    if (isUserPage && session?.user && session.user.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Free users hitting premium pages → redirect to upgrade
    const isPremiumPage = PREMIUM_PAGES.some((page) => pathname.startsWith(page));
    if (isPremiumPage && session?.user && session.user.role !== "admin") {
        const plan = await getUserPlan(session.user.id);
        if (plan !== "premium") {
            return NextResponse.redirect(new URL("/students/upgrade", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/students/:path*", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"],
};
