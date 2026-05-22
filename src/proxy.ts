import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE,
  isPublicPath,
  verifySession,
} from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const result = await verifySession(token);
  if (result.ok) return NextResponse.next();

  // API routes should respond with JSON 401 so the client can surface a toast
  // and re-prompt for login instead of being redirected (which fetch() would
  // silently follow and confuse the caller).
  if (pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized", code: "AUTH_REQUIRED" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  if (pathname !== "/" && pathname !== "/login") {
    loginUrl.searchParams.set("next", pathname + req.nextUrl.search);
  } else {
    loginUrl.searchParams.delete("next");
  }
  return NextResponse.redirect(loginUrl);
}

// Match everything except the Next.js internals and static files. We do our
// own public-path check inside the middleware so the regex stays simple.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
