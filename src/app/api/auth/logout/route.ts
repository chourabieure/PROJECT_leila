import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear cookies by setting them with maxAge 0
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}

