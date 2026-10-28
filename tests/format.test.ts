import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/format";

describe("formatMoney", () => {
  it("formats with two decimals and the currency code", () => {
    expect(formatMoney(1234.5, "USD")).toBe("1,234.50 USD");
  });

  it("omits the currency when there is none", () => {
    expect(formatMoney(99, null)).toBe("99.00");
  });
});
