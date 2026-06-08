import { describe, expect, it } from "vitest";
import { mandarinMainVowel, tokenizeMandarin } from "./mandarin";

describe("mandarinMainVowel", () => {
  it("extracts the tone-bearing vowel", () => {
    expect(mandarinMainVowel("yuè")).toBe("e");
    expect(mandarinMainVowel("hǎo")).toBe("a");
    expect(mandarinMainVowel("xīn")).toBe("i");
  });

  it("normalises ü to u", () => {
    expect(mandarinMainVowel("nǚ")).toBe("u");
  });
});

describe("tokenizeMandarin", () => {
  it("annotates each Han character and passes through other text", () => {
    const tokens = tokenizeMandarin("月 a\n心");
    expect(tokens).toEqual([
      { kind: "unit", text: "月", pron: "yuè", vowel: "e" },
      { kind: "text", text: " a" },
      { kind: "break" },
      { kind: "unit", text: "心", pron: "xīn", vowel: "i" },
    ]);
  });
});
