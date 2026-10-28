import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { accounts, sessions, users, verificationTokens } from "@/lib/schema";

const providers: Provider[] = [];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    accountsTable: accounts,
    sessionsTable: sessions,
    usersTable: users,
    verificationTokensTable: verificationTokens,
  }),
  providers,
});
