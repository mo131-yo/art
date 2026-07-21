/**
 * Бүх зам ажиллаж байгааг нэг дор шалгана.
 *
 *   bun run dev            # эхлээд сервер асаана
 *   bun run smoke          # дараа нь өөр терминалд
 *   bun run smoke 3001     # өөр порт дээр
 *
 * Зөвхөн АСУУДАЛТАЙ замыг хэвлэнэ — цэвэр бол товч дүгнэлт л гарна.
 */

import { artists } from "../lib/artists";
import { movements } from "../lib/movements";

const port = process.argv[2] ?? "3000";
const base = `http://localhost:${port}`;

type Result = { path: string; status: number; problem: string | null; html?: string };

/**
 * ЧУХАЛ: «This page could not be found» гэсэн мөрөөр хайж болохгүй —
 * Next.js dev нь not-found компонентоо RSC payload дотор БҮХ хуудсанд
 * урьдчилан ачаалдаг тул худал эерэг үр дүн өгнө. Оронд нь <title>-г
 * шалгана: жинхэнэ 404 хуудсанд л «404:» гэж эхэлдэг.
 */
async function check(path: string): Promise<Result> {
  try {
    const res = await fetch(`${base}${path}`);
    const html = await res.text();

    if (res.status !== 200) return { path, status: res.status, problem: `HTTP ${res.status}` };

    const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? "";
    if (title.startsWith("404")) return { path, status: res.status, problem: "404 хуудас" };

    for (const m of ["Internal Server Error", "Application error", "Unhandled Runtime Error"]) {
      if (html.includes(m)) return { path, status: res.status, problem: m };
    }

    // Хуудас бодит агуулгатай эсэх — layout л ирээд контент нь хоосон биш байх
    if (html.length < 5_000) {
      return { path, status: res.status, problem: `хэт бага агуулга (${html.length}b)` };
    }

    return { path, status: res.status, problem: null, html };
  } catch (err) {
    return { path, status: 0, problem: (err as Error).message };
  }
}

// ── Шалгах замуудыг цуглуулах ──

const paths: string[] = [
  "/",
  "/artists",
  "/works",
  "/movements",
  "/favorites",
  "/offline",
  // Шүүлтүүрийн хувилбарууд
  "/works?genre=landscape%20painting",
  "/works?featured=1&sort=old",
  "/works?artist=van-gogh,monet&material=oil%20paint",
  "/works?page=2",
];

for (const m of movements) paths.push(`/movements/${m.slug}`);

for (const a of artists) {
  paths.push(`/artists/${a.slug}`);
  paths.push(`/artists/${a.slug}/works`);
}

// ── Ажиллуулах ──

console.log(`\n${base} — ${paths.length} зам шалгаж байна…\n`);

const problems: Result[] = [];
let done = 0;
let checked = 0;

// Зэрэг 6-аар — сервер дарамтгүй, гэхдээ хурдан
const CONCURRENCY = 6;

async function runBatch(list: string[]): Promise<Result[]> {
  const out: Result[] = [];
  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const results = await Promise.all(list.slice(i, i + CONCURRENCY).map(check));
    for (const r of results) {
      done++;
      checked++;
      out.push(r);
      if (r.problem) {
        problems.push(r);
        console.log(`  ✗ ${r.path}\n      ${r.problem}`);
      }
    }
    if (done % 60 === 0) process.stdout.write(`  … ${done} шалгасан\n`);
  }
  return out;
}

const pageResults = await runBatch(paths);

// ── PWA хөрөнгүүд (HTML биш тул тусдаа шалгана) ──

const ASSETS: { path: string; type: string }[] = [
  { path: "/manifest.webmanifest", type: "application/manifest+json" },
  { path: "/sw.js", type: "javascript" },
  { path: "/icons/icon-192.png", type: "image/png" },
  { path: "/icons/icon-512.png", type: "image/png" },
  { path: "/icons/icon-maskable-512.png", type: "image/png" },
  { path: "/icons/apple-touch-icon.png", type: "image/png" },
];

for (const asset of ASSETS) {
  checked++;
  try {
    const res = await fetch(`${base}${asset.path}`);
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok) {
      problems.push({ path: asset.path, status: res.status, problem: `HTTP ${res.status}` });
      console.log(`  ✗ ${asset.path}\n      HTTP ${res.status}`);
    } else if (!ct.includes(asset.type)) {
      problems.push({ path: asset.path, status: res.status, problem: `буруу төрөл: ${ct}` });
      console.log(`  ✗ ${asset.path}\n      буруу төрөл: ${ct}`);
    }
  } catch (err) {
    problems.push({ path: asset.path, status: 0, problem: (err as Error).message });
    console.log(`  ✗ ${asset.path}\n      ${(err as Error).message}`);
  }
}

/*
 * Бүтээлийн хуудсуудыг generated JSON-оос биш, ЗУРААЧИЙН ХУУДСАН ДЭЭРХ
 * бодит линкээс авна. Дата давхарга нь гараар бичсэн бүтээлийг Wikidata-тай
 * нэгтгэхэд id өөрчлөгддөг (ж. `wd-Q698487` → `the-kiss`) тул түүхий JSON-оос
 * уншсан id нь худал 404 өгнө. Хэрэглэгчийн дагах замыг яг дагах нь зөв.
 */
const artworkPaths = new Set<string>();
for (const r of pageResults) {
  if (!r.html || !r.path.endsWith("/works")) continue;
  const hrefs = [...r.html.matchAll(/href="(\/artists\/[^/"]+\/artwork\/[^"]+)"/g)].map((m) => m[1]);
  if (hrefs.length) {
    artworkPaths.add(hrefs[0]); // prerender хийсэн байх магадлалтай
    artworkPaths.add(hrefs[hrefs.length - 1]); // on-demand үүсэх нь
  }
}

console.log(`\n  бүтээлийн ${artworkPaths.size} хуудас шалгаж байна…\n`);
await runBatch([...artworkPaths]);

console.log(`\n${"─".repeat(52)}`);
if (problems.length === 0) {
  console.log(`✓ Бүх ${checked} зам цэвэр\n`);
} else {
  console.log(`✗ ${problems.length} / ${checked} зам асуудалтай\n`);
  process.exit(1);
}
