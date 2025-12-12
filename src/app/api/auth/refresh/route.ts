import { NextRequest, NextResponse } from "next/server";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  AUTH_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Generate new tokens using payload from refresh token (stateless auth)
    // The JWT is signed so we can trust its contents
    const tokenPayload = { userId: payload.userId, username: payload.username };
    const newAccessToken = await generateAccessToken(tokenPayload);
    const newRefreshToken = await generateRefreshToken(tokenPayload);

    // Create response with new cookies
    const response = NextResponse.json({
      message: "Tokens refreshed",
      user: { id: payload.userId, username: payload.username },
    });

    response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

