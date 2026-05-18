import { expect, test } from "@playwright/test";

test("loads the enriched power library without public score chips", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /browse, filter, and pick powers/i })).toBeVisible();
  await expect(page.getByText(/imported\s+8,370/i)).toBeVisible();
  await expect(page.getByText(/Score\s+\d+/)).toHaveCount(0);
  await expect(page.getByText(/High Risk|Medium Risk|Low Risk|Extreme Risk/).first()).toBeVisible();
});

test("loads imported powers from chunks without requesting the monolithic enriched payload", async ({ page }) => {
  const requestedUrls = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/data/")) requestedUrls.push(url);
  });

  await page.goto("/");

  await expect(page.getByText(/imported\s+8,370/i)).toBeVisible();
  expect(requestedUrls.some((url) => url.includes("/data/imported-powers/"))).toBe(true);
  expect(requestedUrls.some((url) => url.includes("/data/superpower-list-enriched.json"))).toBe(false);
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

test("supports keyboard-only search and primary assignment", async ({ page }) => {
  await page.goto("/");

  const canonButton = page.getByRole("button", { name: "Canon" });
  await canonButton.focus();
  await page.keyboard.press("Enter");

  const searchInput = page.getByPlaceholder(/search by name/i);
  await searchInput.focus();
  await page.keyboard.type("fire control");

  const fireCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Fire Control", exact: true })
  }).first();
  await expect(fireCard).toBeVisible();

  const assignButton = fireCard.getByRole("button", { name: /set primary/i });
  await assignButton.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("status").filter({ hasText: /assigned fire control to primary/i })).toBeVisible();
  await expect(page.getByRole("region", { name: "Hero draft" }).locator(".slot-stack").getByText("Fire Control")).toBeVisible();
});

test("supports skip links for keyboard navigation between library and draft", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to power library" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to hero draft" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#hero-draft")).toBeFocused();

  await page.goto("/");
  await page.evaluate(() => {
    if (globalThis.document.activeElement instanceof globalThis.HTMLElement) {
      globalThis.document.activeElement.blur();
    }
  });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to power library" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#power-library")).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByPlaceholder(/search by name/i)).toBeFocused();
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

test("keeps long imported power names wrapped instead of clipped", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Imported" }).click();
  await page.getByPlaceholder(/search by name/i).fill("causality ability generation");

  const heading = page.getByRole("heading", { name: "Causality Ability Generation", exact: true }).first();
  await expect(heading).toBeVisible();

  const style = await heading.evaluate((element) => {
    const computed = globalThis.getComputedStyle(element);
    return {
      overflow: computed.overflow,
      textOverflow: computed.textOverflow,
      whiteSpace: computed.whiteSpace,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth
    };
  });

  expect(style.whiteSpace).toBe("normal");
  expect(style.overflow).not.toBe("hidden");
  expect(style.textOverflow).not.toBe("ellipsis");
  expect(style.scrollWidth).toBeLessThanOrEqual(style.clientWidth + 1);
});

test("keeps power detail popovers inside the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Imported" }).click();
  await page.getByPlaceholder(/search by name/i).fill("fog shield");
  const fogShieldCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Fog Shield", exact: true })
  }).first();
  await expect(fogShieldCard).toBeVisible();

  await fogShieldCard.getByRole("button", { name: /full details/i }).click();
  const details = fogShieldCard.locator(".power-detail-popover");
  await expect(details.getByText("Ranking rationale")).toBeVisible();

  const layout = await details.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      viewportWidth: globalThis.window.innerWidth,
      documentWidth: globalThis.document.documentElement.scrollWidth,
      rankingColumns: globalThis.getComputedStyle(
        element.querySelector(".ranking-label-grid")
      ).gridTemplateColumns.split(" ").length
    };
  });

  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.width).toBeGreaterThan(250);
  expect(layout.rankingColumns).toBe(2);
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

test("rehydrates older saved draft powers from the current library", async ({ page }) => {
  await page.addInitScript(() => {
    const staleDraft = {
      id: "legacy-telepathy",
      name: "Legacy Mind Draft",
      classification: "Legacy Strategist",
      selectedCount: 1,
      savedAt: "2026-05-18T00:00:00.000Z",
      heroBuild: {
        alias: "Legacy Mind",
        civilianName: "",
        homeBase: "",
        motivation: "",
        storyConstraint: "",
        origin: null,
        primary: {
          id: "canon:telepathy",
          selectionId: "canon:telepathy",
          source: "canon",
          name: "Old Telepathy",
          category: "Old Category",
          summary: "stale saved local copy",
          strengths: [],
          weaknesses: [],
          tags: [],
          stats: { offense: 1, defense: 1, mobility: 1, utility: 1, control: 1, risk: 1 }
        },
        secondary: [],
        utility: null,
        limitation: null
      }
    };
    globalThis.localStorage.setItem("powers-forge:saved-drafts", JSON.stringify([staleDraft]));
  });

  await page.goto("/");

  const heroDraft = page.getByRole("region", { name: "Hero draft" });
  await expect(heroDraft.locator(".saved-draft-list").getByText("Legacy Mind Draft")).toBeVisible();
  await heroDraft.locator(".saved-draft-list button").first().click();

  await expect(page.getByRole("status").filter({ hasText: /loaded legacy mind draft/i })).toBeVisible();
  await expect(heroDraft.locator(".slot-stack").getByText("Telepathy")).toBeVisible();
  await expect(heroDraft.locator(".slot-stack").getByText("Old Telepathy")).toHaveCount(0);
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
  const importedQualityGate = page.getByLabel("Imported power quality gate");
  await expect(qualityGate.getByText("Imported Quality Gate")).toBeVisible();
  await expect(qualityGate.getByText(/8,370 visible imported powers/i)).toBeVisible();
  await expect(qualityGate.getByText(/161 records are hidden/i)).toBeVisible();
  await expect(importedQualityGate.getByText("too-broad")).toBeVisible();
  await expect(qualityGate.getByText("Ranking Distribution")).toBeVisible();
  await expect(importedQualityGate.getByText("Core4,591", { exact: true })).toBeVisible();
  await expect(importedQualityGate.getByText("Legendary558", { exact: true })).toBeVisible();
  await expect(qualityGate.getByText("Hidden records review")).toBeVisible();
  await expect(qualityGate.getByText("161 hidden")).toBeVisible();
  await expect(qualityGate.getByRole("button", { name: /privacy-violation 40/i })).toBeVisible();
  await qualityGate.getByRole("button", { name: /privacy-violation 40/i }).click();
  await expect(qualityGate.locator(".hidden-review-list article").first()).toBeVisible();
  await expect(qualityGate.locator(".hidden-review-list").getByText("privacy-violation").first()).toBeVisible();
});

test("explains inferred ranking labels on imported power details", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Imported" }).click();
  await page.getByPlaceholder(/search by name/i).fill("fog shield");
  const fogShieldCard = page.locator(".power-card").filter({
    has: page.getByRole("heading", { name: "Fog Shield", exact: true })
  }).first();
  await expect(fogShieldCard).toBeVisible();

  await fogShieldCard.getByRole("button", { name: /full details/i }).click();

  const details = fogShieldCard.locator(".power-detail-popover");
  await expect(details.getByText("Ranking rationale")).toBeVisible();
  await expect(details.getByText("Rating", { exact: true })).toBeVisible();
  await expect(details.getByText("Confidence", { exact: true })).toBeVisible();
  await expect(details.getByText("secondary fit", { exact: true })).toBeVisible();
  await expect(details.getByText(/ranking labels are inferred guidance/i)).toBeVisible();
});

test("falls back to monolithic enriched data when category chunks are unavailable", async ({ page }) => {
  await page.route("**/data/imported-powers/*.json", async (route) => {
    await route.fulfill({ status: 404, body: "not found" });
  });

  await page.goto("/");

  await expect(page.getByText(/imported\s+8,370/i)).toBeVisible();
  await expect(page.getByText(/161 imported records hidden by quality gate/i)).toBeVisible();

  await page.getByRole("link", { name: /data sources/i }).first().click();
  await expect(page.getByText(/active imported source: quality-gated enriched data/i)).toBeVisible();
});

test("falls back to the raw imported pool when enriched data is unavailable", async ({ page }) => {
  await page.route("**/data/imported-powers/*.json", async (route) => {
    await route.fulfill({ status: 404, body: "not found" });
  });
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

test("keeps the sticky hero forge panel bounded while scrolling desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await page.mouse.wheel(0, 1200);
  await expect(page.getByRole("region", { name: "Hero draft" })).toBeVisible();

  const asideBox = await page.locator(".forge-aside").boundingBox();
  expect(asideBox).not.toBeNull();
  expect(asideBox.x).toBeGreaterThan(900);
  expect(asideBox.y).toBeGreaterThanOrEqual(60);
  expect(asideBox.y + asideBox.height).toBeLessThanOrEqual(900);

  const hasHorizontalOverflow = await page.evaluate(
    () => globalThis.document.documentElement.scrollWidth > globalThis.window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});
