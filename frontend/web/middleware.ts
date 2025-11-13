import { NextRequest, NextResponse } from "next/server";

// Note: Middleware runs on server-side, can't access localStorage
// Instead, we'll use client-side redirect in the page component
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
