import NextAuth, { CredentialsSignin, type DefaultSession, type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { createGuest, getGuest, getGuestWithPassword } from "./data-service";
import { signInSchema } from "./validation";
import {
  LOGIN_MAX_ATTEMPTS,
  LOGIN_WINDOW_MS,
  rateLimit,
  resetRateLimit,
} from "./rate-limit";
import type { Role } from "./types";

declare module "next-auth" {
  interface Session {
    user: { guestId: number; role: Role } & DefaultSession["user"];
  }
}

export class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

function clientIp(request: Request | undefined) {
  const fwd = request?.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || request?.headers.get("x-real-ip") || "unknown";
}

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const key = `login:${email}:${clientIp(request)}`;
        if (!rateLimit(key, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS).allowed) {
          throw new TooManyAttempts();
        }

        const guest = await getGuestWithPassword(email);
        if (!guest?.password) return null;

        const bcrypt = (await import("bcryptjs")).default;
        if (!(await bcrypt.compare(password, guest.password))) return null;

        resetRateLimit(key);
        return { id: String(guest.id), email: guest.email, name: guest.fullName };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (!auth?.user) return false;
      if (pathname.startsWith("/admin") && auth.user.role !== "admin") {
        return NextResponse.redirect(new URL("/account", request.nextUrl));
      }
      return true;
    },
    async signIn({ user, account }) {
      try {
        if (account?.provider !== "credentials" && user.email) {
          const existing = await getGuest(user.email);
          if (!existing) {
            await createGuest({ email: user.email, fullName: user.name ?? user.email });
          }
        }
        return true;
      } catch {
        return false;
      }
    },
    async session({ session }) {
      const guest = await getGuest(session.user?.email);
      if (guest) {
        session.user.guestId = guest.id;
        session.user.role = guest.role ?? "guest";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

export async function requireGuest() {
  const session = await auth();
  if (!session?.user?.guestId) throw new Error("You must be logged in!");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireGuest();
  if (user.role !== "admin") throw new Error("Admins only");
  return user;
}
