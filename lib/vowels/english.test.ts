import { beforeAll, describe, expect, it } from "vitest";
import {
  arpabetToVowel,
  ensureEnglishDict,
  fallbackWordVowels,
  tokenizeEnglish,
  wordVowels,
} from "./english";

describe("arpabetToVowel", () => {
  it("collapses ARPABET vowels (with stress digits) to a/e/i/o/u", () => {
    expect(arpabetToVowel("AE1")).toBe("a"); // cat
    expect(arpabetToVowel("EY2")).toBe("e"); // say
    expect(arpabetToVowel("IY1")).toBe("i"); // beat
    expect(arpabetToVowel("OW0")).toBe("o"); // go
    expect(arpabetToVowel("AH1")).toBe("u"); // love
  });
});

describe("wordVowels", () => {
  it("returns one vowel per syllable, in order", () => {
    expect(wordVowels("L AH1 V")).toEqual(["u"]); // love
    expect(wordVowels("W AH1 N D ER0")).toEqual(["u", "e"]); // wonder
    expect(wordVowels("B Y UW1 T AH0 F AH0 L")).toEqual(["u", "u", "u"]); // beautiful
    expect(wordVowels("R EY1 D IY0 OW2")).toEqual(["e", "i", "o"]); // radio
  });
});

describe("fallbackWordVowels", () => {
  it("maps each written vowel cluster for out-of-dictionary words", () => {
    expect(fallbackWordVowels("skree")).toEqual(["i"]); // ee → i
    expect(fallbackWordVowels("zorp")).toEqual(["o"]);
    expect(fallbackWordVowels("blay")).toEqual(["a"]); // ay → a
    expect(fallbackWordVowels("zorpina")).toEqual(["o", "i", "a"]);
  });
});

describe("tokenizeEnglish", () => {
  beforeAll(async () => {
    await ensureEnglishDict();
  });

  it("annotates each word with its per-syllable vowels (hyphen-joined)", () => {
    const vowels = tokenizeEnglish("love wonder beautiful")
      .filter((t): t is Extract<typeof t, { kind: "unit" }> => t.kind === "unit")
      .map((t) => t.vowel);
    expect(vowels).toEqual(["u", "u-e", "u-u-u"]);
  });

  it("flags words missing from the dictionary as approximate", () => {
    const [token] = tokenizeEnglish("zzqxw");
    expect(token).toMatchObject({ kind: "unit", approx: true });
  });
});
