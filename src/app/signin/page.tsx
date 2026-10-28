import Link from "next/link";
import { signIn } from "@/lib/auth";
import { env } from "@/lib/env";
import { LandingDashboardMock } from "@/components/landing-dashboard-mock";
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

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-300">
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {children}
    </li>
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col bg-surface px-6 py-6 sm:px-10">
        <Link href="/" aria-label="ChaseUp home" className="self-start">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-panel px-2.5 py-1 text-xs font-semibold text-brand">
              Read-only access
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Sign in to ChaseUp</h1>
            <p className="mt-1.5 leading-relaxed text-slate-600">
              New here? Signing in creates your account and starts your 14-day free trial — no
              card required.
            </p>
            {error ? (
              <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Sign-in failed. Please try again.
              </p>
            ) : null}
            {googleConfigured ? (
              <form action={signInWithGoogle} className="mt-6">
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-ink shadow-sm transition-all hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 active:scale-[0.99]"
                >
                  <GoogleMark />
                  Continue with Google
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-semibold text-amber-900">
                  Google sign-in isn&apos;t connected yet
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local, then restart the
                  dev server.
                </p>
              </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-panel px-4 py-2.5 text-center">
              <span className="text-xs font-semibold text-ink">
                14-day free trial on new accounts · No credit card required
              </span>
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
              By continuing you agree to use ChaseUp for chasing your own invoices. Your
              accounting data stays read-only.
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          <Link href="/" className="font-medium text-slate-700 hover:text-ink">
            ← Back to the homepage
          </Link>
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-pine lg:block">
        <div className="relative flex h-full flex-col justify-center px-12 py-16 xl:px-16">
          <p className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
            For B2B service firms
          </p>
          <h2 className="mt-6 max-w-md text-4xl font-bold tracking-tight text-white">
            The money you&apos;re owed,{" "}
            <span className="font-serif font-normal italic text-emerald-300">collected.</span>
          </h2>
          <ul className="mt-6 space-y-3">
            <Check>Automated daily call queue sorted by priority</Check>
            <Check>One-click reminder drafts, ready to send</Check>
            <Check>100% read-only sync with QuickBooks & Xero</Check>
          </ul>
          <div className="mt-10">
            <LandingDashboardMock />
          </div>
        </div>
      </div>
    </div>
  );
}
