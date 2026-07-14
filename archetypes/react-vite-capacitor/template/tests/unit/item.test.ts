import { describe, expect, it } from "vitest";
import { validateItem } from "@/domain/Item.js";

describe("validateItem", () => {
  it("rejects an empty title", () => {
    expect(validateItem({ title: "  " })).toMatch(/required/i);
  });

  it("accepts a real title", () => {
    expect(validateItem({ title: "Buy milk" })).toBeNull();
  });
});
