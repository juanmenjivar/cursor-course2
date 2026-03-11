import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createServerClient } from "./supabase";

export const authOptions: NextAuthOptions = {
  trustHost: true, // Required for Docker, proxies, and dynamic hosts
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;

      // Add/update user in Supabase on sign-in (first login or profile changes)
      try {
        const supabase = createServerClient();
        // Cast to never: manual Database types can cause upsert() to expect 'never' (same as api-keys.ts)
        await supabase.from("users").upsert(
          {
            id: user.id!,
            name: user.name ?? null,
            email: user.email ?? null,
            image: user.image ?? null,
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "id" }
        );
      } catch (err) {
        console.error("Failed to sync user to Supabase:", err);
        // Don't block sign-in if Supabase sync fails
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
