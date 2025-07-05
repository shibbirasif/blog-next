import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    // TODO modularize this middleware
    const headers = new Headers(request.headers);
    headers.set("x-request-path", request.nextUrl.pathname);
    headers.set("x-request-method", request.method);
    NextResponse.next({ headers });
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.well-known/).*)",
    ],
};