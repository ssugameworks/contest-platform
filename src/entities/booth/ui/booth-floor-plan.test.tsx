import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Booth } from "../model/pure";
import { BoothFloorPlan } from "./booth-floor-plan";

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

describe("BoothFloorPlan", () => {
  test("shows an empty-state message when there are no booths", () => {
    render(<BoothFloorPlan booths={[]} teams={[]} />);
    expect(screen.getByText("아직 만들어진 부스가 없어요")).toBeVisible();
  });

  test("shows the team name and location once its cell is tapped", async () => {
    const user = userEvent.setup();
    const booths = [makeBooth({ zone: "A", number: 1, teamId: "team-1" })];
    const teams = [{ id: "team-1", name: "우리팀" }];
    render(<BoothFloorPlan booths={booths} teams={teams} />);

    const cell = screen.getByRole("button");
    await user.click(cell);

    expect(screen.getByText("A-1 · 우리팀")).toBeVisible();
  });

  test("falls back to a placeholder name for an unknown team id", async () => {
    const user = userEvent.setup();
    const booths = [makeBooth({ zone: "A", number: 1, teamId: "missing" })];
    render(<BoothFloorPlan booths={booths} teams={[]} />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("A-1 · 알 수 없는 팀")).toBeVisible();
  });

  test("renders a legend entry for each marker kind present on the map", () => {
    const markers = [
      { zone: "A", number: 1, kind: "info" as const },
      { zone: "A", number: 2, kind: "photo" as const },
    ];
    render(<BoothFloorPlan booths={[]} teams={[]} markers={markers} />);

    expect(screen.getByText("안내")).toBeVisible();
    expect(screen.getByText("포토존")).toBeVisible();
  });

  test("does not render blocked booths as clickable cells", () => {
    const booths = [
      makeBooth({ zone: "A", number: 1, teamId: "team-1", blocked: true }),
    ];
    render(<BoothFloorPlan booths={booths} teams={[]} />);

    // A fully blocked/empty board still renders the empty-state message.
    expect(screen.getByText("아직 만들어진 부스가 없어요")).toBeVisible();
  });
});
