import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    // Google Fonts may be unreachable in sandboxed CI; that is not an app error.
    if (m.type() === "error" && !m.text().includes("fonts.g")) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("M1 happy path: deck → flip → navigate → star → starred deck → lexicon → match", async ({ page, isMobile }) => {
  const errors = trackConsoleErrors(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("nothing else would fit");
  await expectNoA11yViolations(page);

  await page.getByRole("link", { name: /Change & causation/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Change & causation" })).toBeVisible();
  const card = page.getByTestId("flashcard");
  await expect(card).toContainText("catalyze");
  await expect(page.getByText("1 / 24")).toBeVisible();

  // Flip (tap on phones, Space on desktop) and see the definition.
  if (isMobile) await card.click();
  else await page.keyboard.press("Space");
  await expect(card).toHaveAttribute("aria-label", /showing back/);
  await expect(page.getByText("to cause or speed up a change or reaction").first()).toBeVisible();

  // Navigate forward; the next card starts on its front.
  if (isMobile) await page.getByRole("button", { name: "Next card" }).click();
  else await page.keyboard.press("ArrowRight");
  await expect(page.getByText("2 / 24")).toBeVisible();
  await expect(card).toHaveAttribute("aria-label", /showing front/);
  await expect(card).toContainText("precipitate");
  await expectNoA11yViolations(page);

  // Star it, then confirm it's the only card in the Starred deck.
  await page.getByRole("button", { name: "Star precipitate" }).click();
  await expect(page.getByRole("button", { name: "Unstar precipitate" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/cards/starred");
  await expect(page.getByTestId("flashcard")).toContainText("precipitate");
  await expect(page.getByText("1 / 1")).toBeVisible();

  // Lexicon: search by meaning finds the word via its near-synonym.
  await page.goto("/lexicon");
  await page.getByRole("searchbox", { name: "Search words" }).fill("mitig");
  await page.getByRole("button", { name: /^mitigate/ }).click();
  await expect(page.getByText("Planting mangroves along the coast")).toBeVisible();
  await expect(page.getByLabel("Root breakdown of mitigate")).toHaveText("miti·gate");
  await expectNoA11yViolations(page);

  // Match game: solve the board using the definitions shown on the tiles.
  await page.goto("/cards/roots");
  await page.getByRole("tab", { name: "Match" }).click();
  await page.getByRole("button", { name: "Start game" }).click();
  const tiles = page.getByRole("list", { name: "Match tiles" }).getByRole("button");
  await expect(tiles).toHaveCount(12);
  const roots = (JSON.parse(readFileSync(join(__dirname, "../../content/roots.json"), "utf8")) as { roots: { form: string; meaning: string }[] }).roots;
  for (let round = 0; round < 6; round++) {
    const texts = await tiles.evaluateAll((els) => els.filter((e) => !(e as HTMLButtonElement).disabled).map((e) => e.textContent ?? ""));
    const root = roots.find((r) => texts.includes(r.form) && texts.includes(r.meaning))!;
    await tiles.filter({ hasText: new RegExp(`^${root.form.replace(/[/]/g, "\\/")}$`) }).click();
    await tiles.filter({ hasText: new RegExp(`^${root.meaning}$`) }).click();
  }
  await expect(page.getByRole("status")).toContainText("New personal best!");

  expect(errors).toEqual([]);
});
