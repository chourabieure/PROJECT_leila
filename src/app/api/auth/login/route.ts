import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  getUserByUsername,
  generateAccessToken,
  generateRefreshToken,
  AUTH_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, username: user.username };
    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Create response with cookies
    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });

    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

