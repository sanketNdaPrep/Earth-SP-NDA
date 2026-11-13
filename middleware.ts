import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminStatus } from "@/lib/adminAuth";

/** A redirect that keeps any refreshed session cookies, so a token refresh is never lost. */
function redirectKeepingCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  // The admin login and signup pages must open without a session
  const isAdminPublicRoute =
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname === "/admin/signup";
  const isProtectedRoute =
    !isAdminPublicRoute &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/admin"));

  if (isProtectedRoute && !user) {
    return redirectKeepingCookies(new URL("/login", request.url), response);
  }

  // Only approved admins may open the admin area
  if (
    isProtectedRoute &&
    request.nextUrl.pathname.startsWith("/admin") &&
    getAdminStatus(user) !== "approved"
  ) {
    return redirectKeepingCookies(new URL("/admin/login", request.url), response);
  }

  if (isAuthRoute && user) {
    return redirectKeepingCookies(new URL("/dashboard", request.url), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};