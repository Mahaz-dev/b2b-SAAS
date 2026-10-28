import Link from "next/link";
import { signIn } from "@/lib/auth";
import { env } from "@/lib/env";
import { Logo } from "@/components/logo";

async function signInWithGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path
        fill="#4285F5"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#34A853"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#FBBC05"
        d="M24 44c5.4 0 10.3-2.1 13.9-5.5l-6.4-5.4C29.2 34.9 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.7 39.7 16.3 44 24 44z"
      />
      <path
        fill="#EA4335"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.7l6.4 5.4C36.3 39.7 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="ChaseUp home">
            <Logo />
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <h1 className="text-center text-xl font-bold tracking-tight">
            Sign in to ChaseUp
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
            New here? Signing in creates your account and starts your 14-day free trial — no card
            required.
          </p>
          {error ? (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              Sign-in failed. Please try again.
            </p>
          ) : null}
          {googleConfigured ? (
            <form action={signInWithGoogle} className="mt-6">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 active:scale-[0.99]"
              >
                <GoogleMark />
                Continue with Google
              </button>
            </form>
          ) : (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
              Google sign-in is still being set up. Please check back soon.
            </p>
          )}
          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
            By continuing you agree to use ChaseUp for chasing your own invoices. Your accounting
            data stays read-only.
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="font-medium text-slate-700 hover:text-slate-950">
            ← Back to the homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
