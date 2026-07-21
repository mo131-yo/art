/**
 * Wikidata + Wikimedia Commons харвест.
 *
 *   bun run harvest              # бүх зураач
 *   bun run harvest van-gogh     # зөвхөн нэрлэсэн зураач(ид)
 *
 * Гаралт: lib/data/generated/<slug>.json ба index.json (repo-д commit хийнэ).
 * Сайт ажиллах үедээ энэ script-ийг огт дуудахгүй — зөвхөн статик JSON уншина.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { artists } from "../lib/artists";
import { registry, MAX_WORKS_PER_ARTIST, type RegistryEntry } from "./artists-registry";

const UA = "art-gallery-mn/1.0 (https://github.com/ ; student project)";
const WDQS = "https://query.wikidata.org/sparql";
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const OUT_DIR = fileURLToPath(new URL("../lib/data/generated", import.meta.url));

/** Wikimedia thumbnail-ийн стандарт өргөнүүд. Өөр тоо хэрэглэвэл CDN cache алдана. */
const THUMB_WIDTH = 960;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────── SPARQL ─────────────────────────

const query = (qid: string) => `
SELECT ?item ?title ?image ?inception ?sitelinks ?collection ?h ?w
       (GROUP_CONCAT(DISTINCT ?g; separator="|") AS ?genres)
       (GROUP_CONCAT(DISTINCT ?m; separator="|") AS ?materials)
WHERE {
  ?item wdt:P170 wd:${qid} ; wdt:P18 ?image ; wikibase:sitelinks ?sitelinks ;
        rdfs:label ?title . FILTER(lang(?title)="en")
  OPTIONAL { ?item wdt:P571 ?inception }
  OPTIONAL { ?item wdt:P2048 ?h }  OPTIONAL { ?item wdt:P2049 ?w }
  OPTIONAL { ?item wdt:P136 ?gi . ?gi rdfs:label ?g . FILTER(lang(?g)="en") }
  OPTIONAL { ?item wdt:P186 ?mi . ?mi rdfs:label ?m . FILTER(lang(?m)="en") }
  OPTIONAL { ?item wdt:P195 ?ci . ?ci rdfs:label ?collection . FILTER(lang(?collection)="en") }
}
GROUP BY ?item ?title ?image ?inception ?sitelinks ?collection ?h ?w
ORDER BY DESC(?sitelinks)`;

/** WDQS нь тогтворгүй — 502/504 их гардаг тул backoff-той дахин оролдоно. */
async function sparql(qid: string): Promise<string> {
  const delays = [5_000, 15_000, 45_000];
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${WDQS}?query=${encodeURIComponent(query(qid))}`, {
      headers: { Accept: "text/csv", "User-Agent": UA },
    });
    if (res.ok) return res.text();
    if (attempt >= delays.length) {
      throw new Error(`WDQS ${res.status} — ${attempt + 1} удаа оролдсон`);
    }
    process.stdout.write(` [${res.status}, ${delays[attempt] / 1000}с хүлээж дахин оролдоно]`);
    await sleep(delays[attempt]);
  }
}

/** RFC 4180 CSV — талбар дотор таслал, хашилт, мөр таслалт байж болно. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ─────────────────── Commons imageinfo ───────────────────

type ImageMeta = { width: number; height: number };

/**
 * Зургийн ЖИНХЭНЭ пиксел хэмжээг авна — masonry сүлжээнд layout shift
 * үүсгэхгүйн тулд aspect-ыг урьдчилан мэдэх ёстой.
 *
 * URL-ыг өөрөө энд угсрахгүй: upload.wikimedia.org/thumb/... замыг гараар
 * барихад дурын өргөн дээр 400 буцаадаг (туршиж үзсэн). Оронд нь
 * `commons(fileName, width)` буюу Special:FilePath?width= ашиглана — энэ нь
 * MediaWiki-гээр thumbnail үүсгүүлдэг тул ямар ч өргөнд найдвартай.
 */
async function fetchImageMeta(fileNames: string[]): Promise<Map<string, ImageMeta>> {
  const out = new Map<string, ImageMeta>();

  for (let i = 0; i < fileNames.length; i += 50) {
    const batch = fileNames.slice(i, i + 50);
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "imageinfo",
      iiprop: "url|size",
      iiurlwidth: String(THUMB_WIDTH),
      titles: batch.map((n) => `File:${n}`).join("|"),
    });

    let data: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(`${COMMONS}?${params}`, { headers: { "User-Agent": UA } });
      if (res.ok) { data = await res.json(); break; }
      await sleep(3_000 * (attempt + 1));
    }
    if (!data?.query?.pages) continue;

    for (const page of Object.values<any>(data.query.pages)) {
      const info = page.imageinfo?.[0];
      if (!info?.width || !info.height) continue;
      const name = String(page.title).replace(/^File:/, "");
      out.set(name, { width: info.width, height: info.height });
    }

    process.stdout.write(".");
    await sleep(700); // Commons API-д эелдэг хандах
  }
  return out;
}

// ───────────────────── Нормчлол ─────────────────────

export type GeneratedWork = {
  id: string;
  title: string;
  /**
   * Гараар бичсэн бүтээлтэй нэрээр таарсан бол түүний id. Дата давхарга
   * үүгээр монгол нэр, тайлбарыг нэгтгэнэ — ингэснээр онцлох бүтээлүүд ч
   * жанр/материалын шүүлтүүрт бүрэн оролцоно.
   */
  curatedId: string | null;
  year: number | null;
  age: number | null;
  genres: string[];
  materials: string[];
  collection: string | null;
  /** Бодит хэмжээ сантиметрээр (Wikidata) */
  dimsCm: { h: number; w: number } | null;
  /** Wikimedia Commons файлын нэр — `commons(fileName, width)`-д дамжуулна */
  fileName: string;
  aspect: number;
  /** Алдаршлын хэмжүүр: Wikipedia-гийн хэл хоорондын холбоосын тоо */
  rank: number;
};

/** Давхардал шалгахад ашиглах хэлбэр: жижиг үсэг, цэг таслал, "the" авчихна. */
const normTitle = (t: string) =>
  t.toLowerCase().replace(/^(the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, "");

function fileNameFromImageUrl(url: string): string | null {
  const m = url.match(/Special:FilePath\/(.+)$/);
  if (!m) return null;
  return decodeURIComponent(m[1]).replace(/_/g, " ");
}

async function harvestArtist(entry: RegistryEntry) {
  const artist = artists.find((a) => a.slug === entry.slug);
  const birthYear = artist?.birthYear ?? null;

  // Гараар бичсэн бүтээлүүдийг хасахгүй — нэрээр таарсныг нь тэмдэглэж,
  // дата давхаргад монгол текстийг нь дээр нь нэгтгэнэ.
  const curated = new Map(
    (artist?.notableWorks ?? []).map((w) => [normTitle(w.title), w.id] as const)
  );

  process.stdout.write(`  ${entry.slug.padEnd(24)}`);

  const csv = await sparql(entry.qid);
  const rows = parseCsv(csv);
  const header = rows.shift();
  if (!header) throw new Error("CSV хоосон");

  const col = Object.fromEntries(header.map((h, i) => [h, i]));
  const seen = new Set<string>();
  const raw: Omit<GeneratedWork, "aspect">[] = [];

  for (const r of rows) {
    if (r.length < header.length) continue;

    const qid = r[col.item].split("/").pop()!;
    if (seen.has(qid)) continue;

    const title = r[col.title].trim();
    if (!title) continue;

    const fileName = fileNameFromImageUrl(r[col.image]);
    if (!fileName) continue;

    seen.add(qid);

    const year = r[col.inception] ? Number(r[col.inception].slice(0, 4)) : null;
    const h = Number(r[col.h]) || null;
    const w = Number(r[col.w]) || null;

    raw.push({
      id: `wd-${qid}`,
      title,
      curatedId: curated.get(normTitle(title)) ?? null,
      year: Number.isFinite(year) ? year : null,
      age: year && birthYear && year > birthYear ? year - birthYear : null,
      genres: r[col.genres] ? r[col.genres].split("|").filter(Boolean) : [],
      materials: r[col.materials] ? r[col.materials].split("|").filter(Boolean) : [],
      collection: r[col.collection]?.trim() || null,
      dimsCm: h && w ? { h, w } : null,
      fileName,
      rank: Number(r[col.sitelinks]) || 0,
    });
  }

  // Нэг нэр олон бичлэгт таарч болно (ван Гогийн «Sunflowers» долоон хувилбартай,
  // Леонардогийнх хуулбартай). Монгол тайлбарыг зөвхөн хамгийн алдартай нэгд нь
  // өгөхийн тулд эхлээд алдаршлаар эрэмбэлж, давхардсаныг нь цэвэрлэнэ.
  raw.sort((a, b) => b.rank - a.rank);
  const claimed = new Set<string>();
  for (const w of raw) {
    if (!w.curatedId) continue;
    if (claimed.has(w.curatedId)) w.curatedId = null;
    else claimed.add(w.curatedId);
  }

  // Гараар бичсэн нь үргэлж тэргүүнд (хязгаарт таслагдахгүй), дараа нь
  // алдаршил (sitelinks); тэнцвэл он мэдэгдэж буй, музейд байгаа нь түрүүлнэ
  raw.sort((a, b) =>
    Number(b.curatedId !== null) - Number(a.curatedId !== null) ||
    b.rank - a.rank ||
    Number(b.year !== null) - Number(a.year !== null) ||
    Number(b.collection !== null) - Number(a.collection !== null)
  );

  const capped = raw.slice(0, MAX_WORKS_PER_ARTIST);
  const matched = capped.filter((w) => w.curatedId).length;
  const expectCurated = curated.size;
  process.stdout.write(
    ` ${String(capped.length).padStart(5)} бүтээл` +
      (expectCurated ? ` (онцлох ${matched}/${expectCurated})` : "") + " "
  );

  const meta = await fetchImageMeta(capped.map((w) => w.fileName));

  const works: GeneratedWork[] = [];
  for (const w of capped) {
    const m = meta.get(w.fileName);
    if (!m || m.width < 200) continue; // зураг нь олдоогүй эсвэл хэт жижиг
    works.push({ ...w, aspect: Number((m.width / m.height).toFixed(4)) });
  }

  await writeFile(join(OUT_DIR, `${entry.slug}.json`), JSON.stringify(works), "utf8");
  console.log(` → ${works.length} хадгалав`);

  return { slug: entry.slug, count: works.length, expected: entry.expected, works };
}

// ───────────────────────── Үндсэн ─────────────────────────

const only = process.argv.slice(2);
const targets = only.length ? registry.filter((e) => only.includes(e.slug)) : registry;

if (!targets.length) {
  console.error(`Ийм slug бүртгэлд алга: ${only.join(", ")}`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

console.log(`\nХарвест эхэллээ — ${targets.length} зураач\n`);

const results: { slug: string; count: number; expected: number; works: GeneratedWork[] }[] = [];
const failed: { slug: string; error: string }[] = [];

for (const entry of targets) {
  try {
    results.push(await harvestArtist(entry));
  } catch (err) {
    console.log(` ✗ ${(err as Error).message}`);
    failed.push({ slug: entry.slug, error: (err as Error).message });
  }
  await sleep(2_000); // WDQS-д эелдэг хандах
}

// ── index.json: фасетын тоолуур + глобал шилдэг бүтээлүүд ──
if (!only.length) {
  const genres: Record<string, number> = {};
  const materials: Record<string, number> = {};
  const collections: Record<string, number> = {};
  const bump = (rec: Record<string, number>, k: string) => { rec[k] = (rec[k] ?? 0) + 1; };

  const all: (GeneratedWork & { artist: string })[] = [];
  for (const r of results) {
    for (const w of r.works) {
      all.push({ ...w, artist: r.slug });
      w.genres.forEach((g) => bump(genres, g));
      w.materials.forEach((m) => bump(materials, m));
      if (w.collection) bump(collections, w.collection);
    }
  }
  all.sort((a, b) => b.rank - a.rank);

  await writeFile(
    join(OUT_DIR, "index.json"),
    JSON.stringify({
      total: all.length,
      perArtist: Object.fromEntries(results.map((r) => [r.slug, r.count])),
      genres, materials, collections,
      top: all.slice(0, 2000),
    }),
    "utf8"
  );
}

// ── Тайлан ──
const total = results.reduce((s, r) => s + r.count, 0);
console.log(`\n${"─".repeat(52)}`);
console.log(`Нийт: ${total.toLocaleString()} бүтээл / ${results.length} зураач`);

const short = results.filter((r) => r.count < r.expected * 0.5);
if (short.length) {
  console.log(`\n⚠ Хүлээснээс хамаагүй бага (QID эсвэл query-г шалга):`);
  for (const r of short) console.log(`   ${r.slug}: ${r.count} / ${r.expected}`);
}
if (failed.length) {
  console.log(`\n✗ Амжилтгүй ${failed.length}:`);
  for (const f of failed) console.log(`   ${f.slug}: ${f.error}`);
  process.exit(1);
}
console.log();
