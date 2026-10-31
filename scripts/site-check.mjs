import { readFileSync, existsSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const html = read("index.html");
const css = read("assets/css/home.css");
const js = read("assets/js/main.js");
const sitemap = read("sitemap.xml");
const robots = read("robots.txt");

const checks = [];
const check = (name, ok) => checks.push({ name, passed: Boolean(ok) });
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const missingAnchors = [...new Set(anchors.filter(id => !ids.includes(id)))];
const localFiles = [...html.matchAll(/(?:src|href)="((?:assets\/|philosophy\.html)[^"]*)"/g)].map(match => match[1]);
const missingFiles = localFiles.filter(path => !existsSync(path));
const unsafeLinks = [...html.matchAll(/<a[^>]*target="_blank"[^>]*>/g)]
  .map(match => match[0])
  .filter(tag => !tag.includes("noopener") || !tag.includes("noreferrer"));
const bracesBalanced = (css.match(/{/g) || []).length === (css.match(/}/g) || []).length;

check("HTML document, title and language", html.trim().startsWith("<!doctype html>") && html.includes("<title>CICAN ART OF BUSINESS") && html.includes('<html lang="en">'));
check("SEO description, canonical and social metadata", html.includes('name="description"') && html.includes('rel="canonical"') && html.includes('property="og:title"'));
check("Unique IDs and valid in-page navigation", duplicateIds.length === 0 && missingAnchors.length === 0);
check("All referenced local files exist", missingFiles.length === 0);
check("External links use safe target attributes", unsafeLinks.length === 0);
check("Homepage stylesheet braces are balanced", bracesBalanced);
check("Responsive layouts cover tablet and mobile", css.includes("@media(max-width:1000px)") && css.includes("@media(max-width:760px)") && css.includes("@media(max-width:430px)"));
check("Reduced-motion preferences are respected", css.includes("prefers-reduced-motion:reduce"));
check("Mobile navigation has accessible open, close and Escape behavior", js.includes('querySelector(".menu")') && js.includes('querySelector(".site-nav")') && js.includes('event.key === "Escape"') && js.includes('aria-label", open ? "Close navigation"'));
check("Core business sections are present", ["id=" + '"concept"', "id=" + '"services"', "id=" + '"process"', "id=" + '"contact"'].every(value => html.includes(value)));
check("Concept gallery is discoverable from primary navigation", html.includes('<a href="#concept-gallery">CONCEPT GALLERY</a>') && html.includes('id="concept-gallery"'));
check("Three original concept examples are present and labelled", ["THE NEIGHBOURHOOD CAFÉ", "THE INDEPENDENT SHOP", "THE FAMILY VISIT"].every(label => html.includes(label)) && html.includes("ALL THREE EXAMPLES ARE ORIGINAL CONCEPT DEMONSTRATIONS"));
check("Concept artwork is clearly labelled as a demonstration", html.includes("VISUAL DEMONSTRATION") && html.includes("NOT A COMPLETED CLIENT COMMISSION"));
check("Commercial and permission boundaries are explained", html.includes("permissions") && html.includes("usage rights") && html.includes("Printing and distribution are normally arranged"));
check("Philosophy page is linked and sitemap remains aligned", html.includes('href="philosophy.html"') && sitemap.includes("https://cicangeorgealin.github.io/cican-art-of-business/") && robots.includes("Sitemap: https://cicangeorgealin.github.io/cican-art-of-business/sitemap.xml"));

for (const item of checks) console.log((item.passed ? "PASS" : "FAIL") + " — " + item.name);
const failed = checks.filter(item => !item.passed);
console.log("\n" + (checks.length - failed.length) + "/" + checks.length + " checks passed.");
if (failed.length) {
  if (duplicateIds.length) console.error("Duplicate IDs:", duplicateIds);
  if (missingAnchors.length) console.error("Missing anchors:", missingAnchors);
  if (missingFiles.length) console.error("Missing local files:", missingFiles);
  if (unsafeLinks.length) console.error("Unsafe external links:", unsafeLinks);
  process.exitCode = 1;
}
