import * as jose from "jose";
import bcrypt from "bcryptjs";

// Secret keys - in production, use environment variables
const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret-min-32-chars!"
);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret-min-32-chars!"
);

// Token expiration times
export const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

export interface TokenPayload {
  userId: string;
  username: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

// In-memory user store (replace with database in production)
// This is just for demo - in production use Supabase or another DB
const users: Map<string, User> = new Map();

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token generation
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_TOKEN_SECRET);
}

export async function generateRefreshToken(payload: TokenPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(REFRESH_TOKEN_SECRET);
}

// JWT Token verification
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, ACCESS_TOKEN_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, REFRESH_TOKEN_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

// User management (in-memory for demo)
export function createUser(username: string, passwordHash: string): User {
  const id = crypto.randomUUID();
  const user: User = {
    id,
    username,
    passwordHash,
    createdAt: new Date(),
  };
  users.set(id, user);
  return user;
}

export function getUserByUsername(username: string): User | undefined {
  return Array.from(users.values()).find((u) => u.username === username);
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

// Cookie helpers
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

