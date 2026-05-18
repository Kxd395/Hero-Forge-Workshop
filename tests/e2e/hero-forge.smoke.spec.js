import { expect, test } from "@playwright/test";

test("loads the enriched power library without public score chips", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /browse, filter, and pick powers/i })).toBeVisible();
  await expect(page.getByText(/imported\s+8,370/i)).toBeVisible();
  await expect(page.getByText(/Score\s+\d+/)).toHaveCount(0);
  await expect(page.getByText(/High Risk|Medium Risk|Low Risk|Extreme Risk/).first()).toBeVisible();
});

test("searches, assigns a primary power, and shows slot feedback", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Canon" }).click();
  await page.getByPlaceholder(/search by name/i).fill("fire control");
  const fireCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Fire Control", exact: true })
  }).first();
  await expect(fireCard).toBeVisible();

  await fireCard.getByRole("button", { name: /set primary/i }).click();

  await expect(page.getByRole("status").filter({ hasText: /assigned fire control to primary/i })).toBeVisible();
  await expect(page.getByText(/Next slot: Secondary/i)).toBeVisible();
});

test("compares a power and assigns it directly to utility", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Canon" }).click();
  await page.getByPlaceholder(/search by name/i).fill("flight");
  const flightCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Flight", exact: true })
  }).first();
  await expect(flightCard).toBeVisible();
  await flightCard.getByRole("button", { name: "Compare" }).click();

  const compareCard = page.locator(".compare-card").filter({ hasText: "Flight" }).first();
  await expect(compareCard).toBeVisible();
  await compareCard.getByRole("button", { name: "Utility" }).click();

  await expect(page.getByRole("status").filter({ hasText: /assigned flight to utility/i })).toBeVisible();
});

test("keeps the library and forge panel usable on mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /browse, filter, and pick powers/i })).toBeVisible();
  await page.getByPlaceholder(/search by name/i).fill("telepathy");
  await expect(page.getByRole("heading", { name: "Telepathy", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Hero draft" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => globalThis.document.documentElement.scrollWidth > globalThis.window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("saves, clears, and reloads a draft with the selected primary power", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Canon" }).click();
  await page.getByPlaceholder(/search by name/i).fill("telepathy");
  const telepathyCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Telepathy", exact: true })
  }).first();
  await expect(telepathyCard).toBeVisible();
  await telepathyCard.getByRole("button", { name: /set primary/i }).click();

  const heroDraft = page.getByRole("region", { name: "Hero draft" });
  await heroDraft.getByRole("button", { name: "Save draft" }).click();
  await expect(heroDraft.locator(".saved-draft-list").getByText(/1 powers/i)).toBeVisible();

  await heroDraft.getByRole("button", { name: "Clear all" }).click();
  await expect(heroDraft.getByText("Pick a slot, then assign powers from the library to build a structured hero.")).toBeVisible();

  await heroDraft.locator(".saved-draft-list button").first().click();
  await expect(page.getByRole("status").filter({ hasText: /loaded/i })).toBeVisible();
  await expect(heroDraft.locator(".slot-stack").getByText("Telepathy")).toBeVisible();
});

test("review all selected powers overrides active library filters", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Canon" }).click();
  await page.getByPlaceholder(/search by name/i).fill("telepathy");
  const telepathyCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Telepathy", exact: true })
  }).first();
  await expect(telepathyCard).toBeVisible();
  await telepathyCard.getByRole("button", { name: /set primary/i }).click();

  await page.getByPlaceholder(/search by name/i).fill("flight");
  const flightCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Flight", exact: true })
  }).first();
  await expect(flightCard).toBeVisible();
  await flightCard.getByRole("button", { name: "Utility" }).click();

  await page.getByPlaceholder(/search by name/i).fill("nothing-should-match-this");
  await expect(page.getByText("No powers match those filters")).toBeVisible();

  const heroDraft = page.getByRole("region", { name: "Hero draft" });
  await heroDraft.getByRole("button", { name: "Review all selected powers" }).click();

  await expect(page.getByRole("status").filter({ hasText: /reviewing all selected powers/i })).toBeVisible();
  await expect(page.locator(".skill-grid").getByRole("heading", { name: "Telepathy", exact: true })).toBeVisible();
  await expect(page.locator(".skill-grid").getByRole("heading", { name: "Flight", exact: true })).toBeVisible();
});

test("shows imported quality gate counts from the ranking manifest", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/161 imported records hidden by quality gate/i)).toBeVisible();
  await page.getByRole("link", { name: /data sources/i }).first().click();

  const qualityGate = page.getByRole("region", { name: "Data sources" });
  await expect(qualityGate.getByText("Imported Quality Gate")).toBeVisible();
  await expect(qualityGate.getByText(/8,370 visible imported powers/i)).toBeVisible();
  await expect(qualityGate.getByText(/161 records are hidden/i)).toBeVisible();
  await expect(qualityGate.getByText("too-broad")).toBeVisible();
  await expect(qualityGate.getByText("Ranking Distribution")).toBeVisible();
  await expect(qualityGate.getByText("Core")).toBeVisible();
  await expect(qualityGate.getByText("4,591")).toBeVisible();
  await expect(qualityGate.getByText("Legendary")).toBeVisible();
  await expect(qualityGate.getByText("558")).toBeVisible();
});

test("falls back to the raw imported pool when enriched data is unavailable", async ({ page }) => {
  await page.route("**/data/superpower-list-enriched.json", async (route) => {
    await route.fulfill({ status: 404, body: "not found" });
  });

  await page.goto("/");

  await expect(page.getByText(/imported\s+8,531/i).first()).toBeVisible();
  await expect(page.getByText(/hidden by quality gate/i)).toHaveCount(0);

  await page.getByRole("link", { name: /data sources/i }).first().click();
  await expect(page.getByText(/active imported source: fallback imported pool/i)).toBeVisible();
});

test("opens and closes power details from keyboard focus", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Canon" }).click();
  await page.getByPlaceholder(/search by name/i).fill("telepathy");
  const telepathyCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Telepathy", exact: true })
  }).first();
  await expect(telepathyCard).toBeVisible();

  const detailsButton = telepathyCard.getByRole("button", { name: /full details/i });
  await detailsButton.focus();
  await page.keyboard.press("Enter");
  await expect(telepathyCard.getByText("Complete power card")).toBeVisible();

  const closeButton = telepathyCard.getByRole("button", { name: /close/i });
  await closeButton.focus();
  await page.keyboard.press("Enter");
  await expect(telepathyCard.getByText("Complete power card")).toHaveCount(0);
});
