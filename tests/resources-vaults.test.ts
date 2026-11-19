import { describe, expect, it } from "vitest";
import { examsLabel, VAULTS, vaultLabel } from "../lib/resources";

describe("vaults and exam labels", () => {
  it("has the three file vaults", () => {
    expect(VAULTS.map((v) => v.label)).toEqual(["PDF Notes", "Formulas", "Questions PDF"]);
  });
  it("labels a vault and falls back to PDF Notes", () => {
    expect(vaultLabel("formulas")).toBe("Formulas");
    expect(vaultLabel("nope")).toBe("PDF Notes");
  });
  it("writes the exams in plain words, or null when none", () => {
    expect(examsLabel(["nda", "cds"])).toBe("NDA, CDS");
    expect(examsLabel([])).toBeNull();
  });
});
