import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function jumpToScene(page: Page, sceneNumber: number) {
  const desktopNav = page.getByRole("navigation", {
    name: /scene navigator/i,
  });
  if (await desktopNav.isVisible()) {
    await desktopNav
      .getByRole("button", { name: new RegExp(`Scene ${sceneNumber}:`) })
      .click();
    return;
  }

  await page.getByRole("button", { name: "Jump to scene" }).click();
  await page
    .locator(".experience-jump-select")
    .selectOption(String(sceneNumber - 1));
}

test.describe("Income Stack 3D experience", () => {
  test("renders 15 scenes and keeps narrative complete", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-experience-shell]")).toBeVisible();
    await expect(page.locator("[data-experience-scene]")).toHaveCount(15);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "10 Ways to Build Life-Changing Income",
      }),
    ).toBeVisible();
    await expect(page.locator('a[href="#experience-main"]')).toHaveCount(1);
  });

  test("navigator jumps between scenes", async ({ page }) => {
    await page.goto("/");
    await jumpToScene(page, 7);
    await expect(page.locator('[data-slide="07-retail"]')).toBeInViewport();
    await expect(
      page.getByRole("heading", { name: "25% Retail Affiliate Commissions" }),
    ).toBeVisible();
  });

  test("desktop navigator keeps 44px targets with restrained markers", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "desktop navigator only");
    await page.goto("/");
    const step = page.locator(".experience-nav-step").first();
    const marker = step.locator(".experience-nav-hit");
    const [stepBox, markerBox] = await Promise.all([
      step.boundingBox(),
      marker.boundingBox(),
    ]);
    expect(stepBox?.width).toBeGreaterThanOrEqual(44);
    expect(stepBox?.height).toBeGreaterThanOrEqual(44);
    expect(markerBox?.width).toBeLessThanOrEqual(14);
    expect(markerBox?.height).toBeLessThanOrEqual(14);
  });

  test("sound stays off until opt-in", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Enable audio" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(
      page.getByRole("button", { name: "Mute audio" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("closing CTAs and disclosure remain available", async ({ page }) => {
    await page.goto("/");
    await jumpToScene(page, 15);
    const closing = page.locator('[data-slide="15-closing"]');
    await expect(
      closing.getByRole("link", { name: "Get your affiliate link" }),
    ).toBeVisible();
    await expect(
      closing.getByRole("link", { name: "Read the Income Disclosure" }),
    ).toBeVisible();
    await expect(closing.locator(".scene-disclosure")).toContainText(
      "not guaranteed",
    );
  });

  test("legacy deck remains reachable", async ({ page }) => {
    await page.goto("/?view=legacy");
    await expect(page.locator(".deck-shell")).toBeVisible();
    await expect(page.locator("[data-experience-shell]")).toHaveCount(0);
  });

  test("reduced-motion path keeps copy and posters", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator('[data-reduced-motion="true"]')).toBeVisible();
    await expect(page.locator("[data-scene-poster]").first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "10 Ways to Build Life-Changing Income",
      }),
    ).toBeVisible();
  });

  test("warms at most three attached videos initially", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-experience-scene]");
    const attached = await page.locator("video[data-scene-video]").count();
    expect(attached).toBeLessThanOrEqual(3);
  });

  test("plays only the active video", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => {
      const active = document.querySelector<HTMLVideoElement>(
        '[data-slide="01-title"] video[data-scene-video]',
      );
      return Boolean(active && !active.paused);
    });
    const state = await page.evaluate(() => {
      const videos = [
        ...document.querySelectorAll<HTMLVideoElement>(
          "video[data-scene-video]",
        ),
      ];
      return {
        attached: videos.length,
        playing: videos.filter((video) => !video.paused).length,
      };
    });
    expect(state.attached).toBeLessThanOrEqual(3);
    expect(state.playing).toBe(1);
  });

  test("has no serious or critical axe violations on first scene", async ({
    page,
  }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const severe = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
  });

  test("renders a branded full-viewport cinematic lower third", async ({
    page,
  }) => {
    await page.goto("/");
    const brandImage = page.locator(".experience-brand");
    await expect(brandImage).toHaveJSProperty("complete", true);
    await expect
      .poll(() =>
        brandImage.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    const viewport = page.viewportSize()!;
    const scene = page.locator('[data-slide="01-title"]');
    const [stageBox, planeBox, copyBox, brand] = await Promise.all([
      scene.locator("[data-scene-sticky]").boundingBox(),
      scene.locator("[data-scene-plane]").boundingBox(),
      scene.locator("[data-scene-copy]").boundingBox(),
      brandImage.evaluate((element) => {
        const image = element as HTMLImageElement;
        return {
          naturalWidth: image.naturalWidth,
          src: image.getAttribute("src"),
        };
      }),
    ]);

    expect(stageBox?.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(stageBox?.height).toBeGreaterThanOrEqual(viewport.height - 1);
    expect(planeBox?.width).toBeGreaterThan(viewport.width);
    expect(planeBox?.height).toBeGreaterThan(viewport.height);
    expect(copyBox?.x).toBeLessThan(viewport.width * 0.2);
    expect((copyBox?.y ?? 0) + (copyBox?.height ?? 0)).toBeGreaterThan(
      viewport.height * 0.75,
    );
    expect(brand).toEqual({
      naturalWidth: 174,
      src: "/brand/superpatch-company-horizontal-white.svg",
    });

    const headlineStyle = await scene
      .locator(".scene-headline")
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          family: style.fontFamily,
          weight: Number(style.fontWeight),
        };
      });
    expect(headlineStyle.family).toContain("Montserrat");
    expect(headlineStyle.weight).toBeGreaterThanOrEqual(900);
  });

  test("incoming viewport covers the flat receding card", async ({ page }) => {
    await page.goto("/");
    const viewport = page.viewportSize()!;
    await page.evaluate(
      (height) => window.scrollTo(0, height * 0.5),
      viewport.height,
    );
    await page.waitForTimeout(900);

    const state = await page.evaluate(() => {
      const cards = [
        ...document.querySelectorAll<HTMLElement>("[data-scene-card]"),
      ];
      const outgoing = cards[0];
      const incoming = cards[1];
      const incomingRect = incoming.getBoundingClientRect();
      const outgoingMatrix = new DOMMatrix(
        getComputedStyle(outgoing).transform,
      );
      const incomingMatrix = new DOMMatrix(
        getComputedStyle(incoming).transform,
      );
      const sample = document.elementFromPoint(
        window.innerWidth / 2,
        Math.min(window.innerHeight - 2, incomingRect.top + 8),
      );
      return {
        incomingTop: incomingRect.top,
        incomingBottom: incomingRect.bottom,
        incomingRotation: Math.atan2(incomingMatrix.b, incomingMatrix.a),
        outgoingScale: outgoingMatrix.a,
        outgoingRotation: Math.atan2(outgoingMatrix.b, outgoingMatrix.a),
        sampleSlide: sample
          ?.closest("[data-slide]")
          ?.getAttribute("data-slide"),
      };
    });

    expect(state.incomingTop).toBeGreaterThan(0);
    expect(state.incomingTop).toBeLessThan(viewport.height);
    expect(state.incomingBottom).toBeGreaterThan(viewport.height);
    expect(state.outgoingScale).toBeLessThan(1);
    expect(state.outgoingRotation).toBeCloseTo(0, 5);
    expect(state.incomingRotation).toBeCloseTo(0, 5);
    expect(state.sampleSlide).toBe("02-question");
  });

  test("media, scrim, and typography occupy distinct parallax planes", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    const viewport = page.viewportSize()!;
    await page.evaluate(
      (height) => window.scrollTo(0, height * 0.72),
      viewport.height,
    );
    await page.waitForTimeout(900);

    const travel = await page
      .locator('[data-slide="02-question"]')
      .evaluate((scene) => {
        const y = (selector: string) => {
          const element = scene.querySelector<HTMLElement>(selector)!;
          return new DOMMatrix(getComputedStyle(element).transform).m42;
        };
        return {
          media: y("[data-scene-plane]"),
          scrim: y("[data-scene-scrim]"),
          headline: y('[data-anim-layer="headline"]'),
          body: y('[data-anim-layer="body"]'),
        };
      });

    // Touch copyMode skips body/headline y parallax; media vs scrim still diverge.
    if (testInfo.project.name === "desktop-chrome") {
      expect(new Set(Object.values(travel)).size).toBe(4);
      expect(travel.headline).not.toBe(travel.body);
    } else {
      expect(travel.media).not.toBe(travel.scrim);
      expect(travel.body).toBe(0);
    }
  });

  test("captures representative visual baselines", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "desktop baselines only");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(900);
    await expect(page).toHaveScreenshot("scene-01-title.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.03,
    });
    await jumpToScene(page, 7);
    await expect(page.locator('[data-slide="07-retail"]')).toBeInViewport();
    await expect(page).toHaveScreenshot("scene-07-retail.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.03,
    });
    await jumpToScene(page, 15);
    await expect(page.locator('[data-slide="15-closing"]')).toBeInViewport();
    await expect(page).toHaveScreenshot("scene-15-closing.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.03,
    });
  });

  test("captures portrait and mobile-landscape baselines", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "mobile baselines only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForTimeout(900);
    await expect(page).toHaveScreenshot("scene-01-title-390x844.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.03,
    });

    await page.setViewportSize({ width: 844, height: 390 });
    await page.reload();
    await jumpToScene(page, 7);
    await expect(page.locator('[data-slide="07-retail"]')).toBeInViewport();
    await page.waitForTimeout(900);
    await expect(page).toHaveScreenshot("scene-07-retail-844x390.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.03,
    });
  });
});

test.describe("Premium V2 experience contracts", () => {
  test("shows chapter counter and foundation label on first scene", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("01 / 15")).toBeVisible();
    await expect(page.getByText("Foundation")).toBeVisible();
  });

  test("shows first-scroll cue on scene 1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/(scroll|swipe) to explore/i)).toBeVisible();
    await expect(page.locator("[data-scroll-cue]")).toHaveAttribute(
      "data-dismissed",
      "false",
    );
  });

  test("uses continuous scroll-linked progress rather than index steps", async ({
    page,
  }) => {
    await page.goto("/");
    const progress = page.locator("[data-experience-progress]");
    const initial = await progress.evaluate((el) =>
      getComputedStyle(el).transform,
    );
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(200);
    const mid = await progress.evaluate((el) =>
      getComputedStyle(el).transform,
    );
    expect(mid).not.toBe(initial);
    expect(mid).not.toBe("none");
  });

  test("rapid jumps leave no intermediate annotations on destination scene", async ({
    page,
  }) => {
    await page.goto("/");
    await jumpToScene(page, 8);
    await page.waitForTimeout(1200);
    await jumpToScene(page, 15);
    await page.waitForTimeout(1200);

    const closing = page.locator('[data-slide="15-closing"]');
    await expect(closing).toBeInViewport();
    await expect(page.locator("[data-plate-annotation]")).toHaveCount(0);
    await expect(
      closing.locator("[data-stream-index], [data-progress-spine]"),
    ).toHaveCount(0);
  });

  test("accepts validated e2e CTA destinations without hash placeholders", async ({
    page,
  }) => {
    await page.goto("/");
    await jumpToScene(page, 15);
    const primary = page.locator('[data-slide="15-closing"] [data-cta="primary"]');
    const secondary = page.locator(
      '[data-slide="15-closing"] [data-cta="secondary"]',
    );
    await expect(primary).toHaveAttribute("href", /^https:\/\//);
    await expect(secondary).toHaveAttribute("href", /^https:\/\//);
  });

  test("marks poster readiness before crossfade on active video", async ({
    page,
  }) => {
    await page.goto("/");
    const titleScene = page.locator('[data-slide="01-title"]');
    await expect(titleScene.locator("[data-scene-poster]")).toHaveAttribute(
      "data-poster-visible",
      "true",
    );
    await page.waitForFunction(() => {
      const video = document.querySelector<HTMLVideoElement>(
        '[data-slide="01-title"] [data-scene-video]',
      );
      return video?.getAttribute("data-video-ready") === "true";
    });
  });

  test("has no serious or critical axe violations on scene 7", async ({
    page,
  }) => {
    await page.goto("/");
    await jumpToScene(page, 7);
    await expect(page.locator('[data-slide="07-retail"]')).toBeInViewport();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const severe = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
  });

  test("has no serious or critical axe violations on scene 15", async ({
    page,
  }) => {
    await page.goto("/");
    await jumpToScene(page, 15);
    await expect(page.locator('[data-slide="15-closing"]')).toBeInViewport();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const severe = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
  });

  test("respects 390x844 safe areas without covering lower-third copy", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const layout = await page.locator('[data-slide="01-title"]').evaluate(() => {
      const copy = document.querySelector<HTMLElement>(
        '[data-slide="01-title"] [data-scene-copy]',
      )!;
      const controls = document.querySelector<HTMLElement>(
        ".experience-controls",
      )!;
      const compactNav = document.querySelector<HTMLElement>(
        ".experience-compact-nav",
      )!;
      const copyBox = copy.getBoundingClientRect();
      const controlsBox = controls.getBoundingClientRect();
      const compactNavBox = compactNav.getBoundingClientRect();
      return {
        copyTop: copyBox.top,
        copyBottom: copyBox.bottom,
        controlsTop: controlsBox.top,
        compactNavBottom: compactNavBox.bottom,
        copyVisible: copyBox.height > 0,
      };
    });
    expect(layout.copyVisible).toBe(true);
    expect(layout.compactNavBottom).toBeLessThanOrEqual(layout.copyTop - 8);
    expect(layout.controlsTop).toBeGreaterThanOrEqual(layout.copyBottom - 4);
  });

  test("uses compact mobile navigation at 375x812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByText("01 / 15")).toBeVisible();
    await expect(page.locator("[data-nav-mode='compact']")).toBeVisible();
    await expect(
      page.locator(".experience-nav-list button"),
    ).toHaveCount(0);
  });

  test("keeps short mobile-landscape copy inside the viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/");
    await jumpToScene(page, 7);
    const layout = await page.locator('[data-slide="07-retail"]').evaluate((scene) => {
      const copy = scene.querySelector<HTMLElement>("[data-scene-copy]")!;
      const headline = scene.querySelector<HTMLElement>(".scene-headline")!;
      const rect = copy.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        headlineSize: Number.parseFloat(getComputedStyle(headline).fontSize),
      };
    });
    expect(layout.top).toBeGreaterThanOrEqual(60);
    expect(layout.bottom).toBeLessThanOrEqual(382);
    expect(layout.headlineSize).toBeLessThanOrEqual(50);
  });

  test("mobile V3: swipe cue, 44px chrome, mid-funnel affiliate CTA", async ({
    page,
  }, testInfo) => {
    test.skip(
      !["mobile-chrome", "iphone-390", "iphone-375"].includes(testInfo.project.name),
      "touch portrait projects only",
    );
    await page.goto("/");
    await expect(page.locator("[data-scroll-cue]")).toContainText(
      "Swipe to explore",
    );

    const jump = page.getByRole("button", { name: "Jump to scene" });
    const sound = page.getByRole("button", { name: "Enable audio" });
    for (const control of [jump, sound]) {
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }

    await jumpToScene(page, 7);
    const affiliate = page.locator(".experience-affiliate-cta-link");
    await expect(affiliate).toBeVisible();
    const affiliateBox = await affiliate.boundingBox();
    expect(affiliateBox?.height).toBeGreaterThanOrEqual(44);
    await expect(affiliate).toHaveAttribute("href", /^https:/);
  });
});
