import { parseCriteria } from "@/lib/achievements/criteria";

describe("achievement criteria parsing", () => {
  it("accepts library_count criteria", () => {
    expect(parseCriteria({ type: "library_count", min: 1 })).toEqual({
      type: "library_count",
      min: 1,
    });
  });

  it("accepts status_count criteria", () => {
    expect(
      parseCriteria({ type: "status_count", status: "COMPLETED", min: 3 }),
    ).toEqual({
      type: "status_count",
      status: "COMPLETED",
      min: 3,
    });
  });

  it("rejects invalid criteria", () => {
    expect(parseCriteria({ type: "library_count", min: 0 })).toBeNull();
    expect(parseCriteria({ type: "unknown" })).toBeNull();
  });
});
