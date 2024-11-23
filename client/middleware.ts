import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log({ cookies: request.cookies });
  // Check if the user is authenticated using a cookie
  const jwtCookie = request.cookies.get("jwt");
  if (!jwtCookie?.value) {
    // If the cookie is not present, redirect to the login page
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If the user is authenticated, continue with the request
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/chat"
};
