import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  createUser,
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

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = createUser(username, passwordHash);

    // Generate tokens
    const tokenPayload = { userId: user.id, username: user.username };
    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Create response with cookies
    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: { id: user.id, username: user.username },
      },
      { status: 201 }
    );

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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

