import { describe, expect, it } from "vitest";
import { jyutpingMainVowel, tokenizeCantonese } from "./cantonese";

describe("jyutpingMainVowel", () => {
  it("collapses the nucleus to a/e/i/o/u", () => {
    expect(jyutpingMainVowel("gam3")).toBe("a");
    expect(jyutpingMainVowel("sing6")).toBe("i");
    expect(jyutpingMainVowel("hoi1")).toBe("o");
    expect(jyutpingMainVowel("jyut6")).toBe("u");
    expect(jyutpingMainVowel("goek3")).toBe("e"); // oe → e
    expect(jyutpingMainVowel("seon1")).toBe("e"); // eo → e
    expect(jyutpingMainVowel("saam1")).toBe("a"); // aa → a
  });

  it("returns empty for syllabic nasals", () => {
    expect(jyutpingMainVowel("m4")).toBe(""); // 唔
    expect(jyutpingMainVowel("ng5")).toBe(""); // 五
  });
});

describe("tokenizeCantonese", () => {
  it("annotates Han characters with their Jyutping vowel", () => {
    const tokens = tokenizeCantonese("開");
    expect(tokens).toEqual([
      { kind: "unit", text: "開", pron: "hoi1", vowel: "o" },
    ]);
  });
});
