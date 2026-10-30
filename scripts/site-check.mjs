import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const html = read("index.html");
const css = read("assets/css/style.css");
const js = read("assets/js/main.js");
const sitemap = read("sitemap.xml");
const robots = read("robots.txt");

const checks = [];
const check = (name, condition) => checks.push({ name, passed: Boolean(condition) });

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const hrefs = [...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const missingAnchors = [...new Set(hrefs.filter((href) => !ids.includes(href)))];
const localAssets = [...html.matchAll(/(?:src|href)="((?:assets\/)[^"]+)"/g)].map((match) => match[1]);
const missingAssets = localAssets.filter((path) => !existsSync(path));
const externalBlankLinks = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((match) => match[0]);
const unsafeExternalLinks = externalBlankLinks.filter((tag) => !/rel="[^"]*noopener[^"]*"/.test(tag));

check("HTML5 document declaration", /^<!doctype html>/i.test(html.trim()));
check("Page title and meta description", /<title>[^<]+<\/title>/.test(html) && /<meta name="description" content="[^"]+"/.test(html));
check("Unique HTML IDs", duplicateIds.length === 0);
check("All in-page navigation links resolve", missingAnchors.length === 0);
check("Referenced local assets exist", missingAssets.length === 0);
check("External new-tab links use noopener", unsafeExternalLinks.length === 0);
check("CSS braces are balanced", (css.match(/{/g) ?? []).length === (css.match(/}/g) ?? []).length);
check("Mobile responsive breakpoints exist", /max-width:\s*950px/.test(css) && /max-width:\s*680px/.test(css));
check("Reduced-motion preference is respected", /prefers-reduced-motion:\s*reduce/.test(css) && js.includes("prefers-reduced-motion: reduce"));
check("Mobile navigation supports Escape", js.includes('event.key === "Escape"'));
check("Reveal animation targets current sections", js.includes(".journey-card") && js.includes(".method-grid article"));
check("Canonical URL matches sitemap", html.includes('rel="canonical" href="https://cicangeorgealin.github.io/cican-art-of-business/"') && sitemap.includes("https://cicangeorgealin.github.io/cican-art-of-business/"));
check("Robots file points to sitemap", robots.includes("Sitemap: https://cicangeorgealin.github.io/cican-art-of-business/sitemap.xml"));
check("Concept illustrations are clearly disclosed", /fictional concept examples/.test(html) && /not completed client work or an existing business partnership/.test(html));
check("Photography and brand use require prior agreement", /agree permission/.test(html) && /agreed with the business before work begins/.test(html));
check("No named real-company example is embedded", !/IKEA|Tesco|McDonald/i.test(html));

for (const result of checks) {
  console.log((result.passed ? "PASS" : "FAIL") + " — " + result.name);
}
const failed = checks.filter((result) => !result.passed);
console.log("\n" + (checks.length - failed.length) + "/" + checks.length + " checks passed.");
if (failed.length) {
  if (duplicateIds.length) console.error("Duplicate IDs:", duplicateIds);
  if (missingAnchors.length) console.error("Missing anchor targets:", missingAnchors);
  if (missingAssets.length) console.error("Missing local assets:", missingAssets);
  if (unsafeExternalLinks.length) console.error("Unsafe external links:", unsafeExternalLinks);
  process.exitCode = 1;
}
