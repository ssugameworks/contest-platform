import { describe, expect, test } from "bun:test";
import type { Booth, BoothMarker } from "./pure";
import { buildBoothMatrix, formatBoothLocation } from "./pure";

function makeBooth(overrides: Partial<Booth> = {}): Booth {
  return {
    id: "booth-1",
    teamId: null,
    zone: "A",
    number: 1,
    blocked: false,
    ...overrides,
  };
}

describe("formatBoothLocation", () => {
  test("joins zone and number with a dash", () => {
    expect(formatBoothLocation({ zone: "A", number: 3 })).toBe("A-3");
  });
});

describe("buildBoothMatrix", () => {
  test("returns empty zones/grid when there are no booths or markers", () => {
    const result = buildBoothMatrix([], []);
    expect(result.zones).toEqual([]);
    expect(result.grid).toEqual([]);
  });

  test("sorts zones alphabetically regardless of input order", () => {
    const booths = [makeBooth({ zone: "C" }), makeBooth({ zone: "A" })];
    const result = buildBoothMatrix(booths, []);
    expect(result.zones).toEqual(["A", "C"]);
  });

  test("filters out blocked booths from the grid", () => {
    const booths = [makeBooth({ zone: "A", number: 1, blocked: true })];
    const result = buildBoothMatrix(booths, []);
    // A blocked booth contributes no zone/column, so the grid stays empty.
    expect(result.zones).toEqual([]);
  });

  test("places a booth at its zone/number cell", () => {
    const booth = makeBooth({ zone: "A", number: 2, teamId: "team-1" });
    const result = buildBoothMatrix([booth], []);
    expect(result.columns).toBe(2);
    const cell = result.grid[0][1];
    expect(cell.booth?.teamId).toBe("team-1");
    expect(cell.number).toBe(2);
  });

  test("places a marker independently of booths, sharing coordinates", () => {
    const marker: BoothMarker = { zone: "B", number: 1, kind: "info" };
    const result = buildBoothMatrix([], [marker]);
    expect(result.zones).toEqual(["B"]);
    expect(result.grid[0][0].marker?.kind).toBe("info");
  });

  test("expands columns beyond matrixConfig when real data is larger", () => {
    const booth = makeBooth({ zone: "A", number: 5 });
    const result = buildBoothMatrix([booth], [], {
      zones: ["A"],
      columns: 2,
    });
    expect(result.columns).toBe(5);
  });

  test("uses matrixConfig zones even when no booth occupies them yet", () => {
    const result = buildBoothMatrix([], [], { zones: ["A", "B"], columns: 3 });
    expect(result.zones).toEqual(["A", "B"]);
    expect(result.columns).toBe(3);
  });

  test("falls back to a single column when everything is empty", () => {
    const result = buildBoothMatrix([], [], { zones: ["A"], columns: 0 });
    expect(result.columns).toBe(1);
  });
});
