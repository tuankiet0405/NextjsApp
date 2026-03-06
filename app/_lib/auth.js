import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { createGuest, getGuest } from "./data-service";
import supabase from "./supabase";

const authConfig = {
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Fetch guest with password from Supabase
        const { data: guest, error } = await supabase
          .from("guests")
          .select("id, email, fullName, password")
          .eq("email", credentials.email)
          .single();

        if (error || !guest || !guest.password) return null;

        const bcrypt = (await import("bcryptjs")).default;
        const isValid = await bcrypt.compare(
          credentials.password,
          guest.password
        );
        if (!isValid) return null;

        return {
          id: guest.id,
          email: guest.email,
          name: guest.fullName,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async signIn({ user, account, profile }) {
      try {
        // For OAuth providers, auto-create guest if not exists
        if (account?.provider !== "credentials") {
          const existingGuest = await getGuest(user.email);
          if (!existingGuest) {
            await createGuest({ email: user.email, fullName: user.name });
          }
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    async session({ session, user }) {
      const guest = await getGuest(session.user?.email);
      session.user.guestId = guest.id;
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


