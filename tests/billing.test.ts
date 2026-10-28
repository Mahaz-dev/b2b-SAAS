import { describe, expect, it } from "vitest";
import { hasBillingAccess, trialEndsAt } from "@/lib/billing";

describe("trialEndsAt", () => {
  it("adds fourteen days to the organization creation date", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    expect(trialEndsAt({ createdAt })).toEqual(new Date("2026-01-15T00:00:00.000Z"));
  });
});

describe("hasBillingAccess", () => {
  const recent = { createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  const expired = { createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };

  it("grants access for active, trialing, and past-due subscriptions", () => {
    for (const status of ["active", "trialing", "past_due"]) {
      expect(hasBillingAccess(expired, { status })).toBe(true);
    }
  });

  it("denies access for canceled subscriptions after the trial", () => {
    expect(hasBillingAccess(expired, { status: "canceled" })).toBe(false);
  });

  it("grants access during the trial without a subscription", () => {
    expect(hasBillingAccess(recent, null)).toBe(true);
  });

  it("denies access after the trial without a subscription", () => {
    expect(hasBillingAccess(expired, null)).toBe(false);
  });
});
