import assert from 'node:assert/strict';

const { chromium, firefox, webkit } = await import(
  process.env.PLAYWRIGHT_MODULE ?? 'playwright'
);
const origin = process.env.PORTFOLIO_URL ?? 'http://localhost:3123';
const engines = { chromium, firefox, webkit };
const requested = process.argv.slice(2);
const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 1280, height: 900 },
];

async function expectDestination(page, id, mobile) {
  let state;
  for (let attempt = 0; attempt < 60; attempt++) {
    state = await page.locator('html').evaluate(
      (root, { id, mobile }) => {
        const target = document.getElementById(id);
        const header = document.querySelector('.site-header');
        const nav = document.querySelector(
          mobile ? '.mobile-nav' : '.desktop-nav',
        );
        return {
          hash: location.hash,
          focus: document.activeElement.id,
          active: nav.querySelector('[aria-current="location"]')?.hash,
          offset:
            target.getBoundingClientRect().top -
            header.getBoundingClientRect().bottom,
          overflow: root.scrollWidth - root.clientWidth,
        };
      },
      { id, mobile },
    );
    if (
      state.hash === `#${id}` &&
      state.focus === id &&
      state.active === `#${id}` &&
      Math.abs(state.offset - 16) <= 2 &&
      state.overflow === 0
    )
      return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(`${id} did not settle: ${JSON.stringify(state)}`);
}

for (const name of requested.length ? requested : Object.keys(engines)) {
  let browser;
  try {
    browser = await engines[name].launch({
      executablePath:
        process.env[`PLAYWRIGHT_${name.toUpperCase()}_EXECUTABLE`],
    });
    for (const viewport of viewports) {
      for (const reducedMotion of ['no-preference', 'reduce']) {
        const page = await browser.newPage({ viewport, reducedMotion });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text());
        });
        try {
          await page.goto(origin);
          await page.waitForLoadState('networkidle');
          const mobile = viewport.width < 832;
          assert.equal(
            await page
              .locator('html')
              .evaluate((root) => getComputedStyle(root).scrollBehavior),
            reducedMotion === 'reduce' ? 'auto' : 'smooth',
          );
          for (const id of ['about', 'skills', 'projects']) {
            if (mobile) await page.locator('.menu-trigger').press('Enter');
            await page
              .locator(
                `${mobile ? '.mobile-nav' : '.desktop-nav'} a[href="#${id}"]`,
              )
              .press('Enter');
            await expectDestination(page, id, mobile);
          }
          for (const id of ['skills', 'about']) {
            await page.goBack();
            await expectDestination(page, id, mobile);
          }
          for (const id of ['skills', 'projects']) {
            await page.goForward();
            await expectDestination(page, id, mobile);
          }
          assert.deepEqual(errors, []);
          console.log(
            `${name} ${browser.version()} ${viewport.width}×${viewport.height} ${reducedMotion}: passed`,
          );
        } finally {
          await page.close();
        }
      }
    }
    const page = await browser.newPage({
      javaScriptEnabled: false,
      viewport: viewports[0],
    });
    await page.goto(origin);
    await page.locator('.menu-trigger').press('Enter');
    await page.locator('.mobile-nav a[href="#about"]').press('Enter');
    assert.equal(new URL(page.url()).hash, '#about');
    assert.ok(
      await page
        .getByRole('heading', { name: 'About', exact: true })
        .isVisible(),
    );
    await page.close();
    console.log(`${name}: native anchor navigation without JavaScript passed`);
  } catch (error) {
    console.error(`${name}: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await browser?.close();
  }
}
