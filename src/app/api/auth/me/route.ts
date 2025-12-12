import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessToken,
  ACCESS_TOKEN_COOKIE,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify access token
    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Return user info from JWT payload (stateless auth)
    // The JWT is signed so we can trust its contents
    return NextResponse.json({
      user: { id: payload.userId, username: payload.username },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

