/**
 * Зураач бүрийн Wikidata QID.
 *
 * Эдгээр QID-үүдийг Wikidata-аас `rdfs:label` + `P106` (мэргэжил: зураач)-аар
 * шууд шалгаж баталгаажуулсан. Хажууд нь бичсэн тоо нь харвестийн үед
 * хүлээгдэж буй бүтээлийн тоо (P170 бүтээгч + P18 зурагтай) — хэрэв харвест
 * үүнээс эрс бага тоо буцаавал QID буруу эсвэл query унасан гэсэн үг.
 *
 * ЗОХИОГЧИЙН ЭРХ: Wikimedia Commons зөвхөн нийтийн эзэмшлийн зургийг агуулна.
 * Тиймээс XX зууны зураачдын ихэнх нь энд байхгүй — Пикассо, Дали (13),
 * Миро (23), Фрида Кало (0), Шагал (22), Хоппер (35) зэргийг зориуд оруулаагүй.
 */

export type RegistryEntry = {
  slug: string;
  qid: string;
  /** Wikidata дээрх бүтээлийн тоо — шалгасан утга */
  expected: number;
};

/** Нэг зураачаас харвест хийх дээд хязгаар (алдаршлаар эрэмбэлсний дараа) */
export const MAX_WORKS_PER_ARTIST = 1200;

export const registry: RegistryEntry[] = [
  // ── Одоо байгаа 16 (гараар бичсэн намтартай) ──
  { slug: "leonardo-da-vinci", qid: "Q762", expected: 775 },
  { slug: "michelangelo", qid: "Q5592", expected: 174 },
  { slug: "caravaggio", qid: "Q42207", expected: 114 },
  { slug: "rembrandt", qid: "Q5598", expected: 1232 },
  { slug: "vermeer", qid: "Q41264", expected: 36 },
  { slug: "goya", qid: "Q5432", expected: 782 },
  { slug: "hokusai", qid: "Q5586", expected: 338 },
  { slug: "turner", qid: "Q159758", expected: 1001 },
  { slug: "degas", qid: "Q46373", expected: 637 },
  { slug: "cezanne", qid: "Q35548", expected: 801 },
  { slug: "monet", qid: "Q296", expected: 1219 },
  { slug: "renoir", qid: "Q39931", expected: 1740 },
  { slug: "van-gogh", qid: "Q5582", expected: 1113 },
  { slug: "seurat", qid: "Q34013", expected: 172 },
  { slug: "klimt", qid: "Q34661", expected: 178 },
  { slug: "munch", qid: "Q41406", expected: 1963 },

  // ── Сэргэн мандалт ба Барокко ──
  { slug: "van-eyck", qid: "Q102272", expected: 66 },
  { slug: "botticelli", qid: "Q5669", expected: 196 },
  { slug: "bosch", qid: "Q130531", expected: 119 },
  { slug: "durer", qid: "Q5580", expected: 804 },
  { slug: "titian", qid: "Q47551", expected: 421 },
  { slug: "raphael", qid: "Q5597", expected: 324 },
  { slug: "el-greco", qid: "Q301", expected: 542 },
  { slug: "rubens", qid: "Q5599", expected: 1724 },
  { slug: "artemisia-gentileschi", qid: "Q212657", expected: 132 },
  { slug: "velazquez", qid: "Q297", expected: 196 },
  { slug: "van-dyck", qid: "Q150679", expected: 1408 },

  // ── Сонгодог үзэл ба Романтизм ──
  { slug: "jacques-louis-david", qid: "Q83155", expected: 298 },
  { slug: "ingres", qid: "Q23380", expected: 278 },
  { slug: "friedrich", qid: "Q104884", expected: 358 },
  { slug: "constable", qid: "Q159297", expected: 537 },
  { slug: "delacroix", qid: "Q33477", expected: 526 },
  { slug: "aivazovsky", qid: "Q181568", expected: 332 },

  // ── Реализм ──
  { slug: "millet", qid: "Q148458", expected: 241 },
  { slug: "courbet", qid: "Q34618", expected: 590 },
  { slug: "repin", qid: "Q172911", expected: 282 },

  // ── Импрессионизм ──
  { slug: "manet", qid: "Q40599", expected: 433 },
  { slug: "pissarro", qid: "Q134741", expected: 835 },
  { slug: "morisot", qid: "Q105320", expected: 200 },
  { slug: "cassatt", qid: "Q173223", expected: 254 },

  // ── Пост-импрессионизм ──
  { slug: "gauguin", qid: "Q37693", expected: 739 },
  { slug: "toulouse-lautrec", qid: "Q82445", expected: 553 },
  { slug: "henri-rousseau", qid: "Q156386", expected: 140 },

  // ── Японы модон бар ──
  { slug: "hiroshige", qid: "Q200798", expected: 368 },

  // ── XX зууны эхэн ──
  { slug: "mucha", qid: "Q146691", expected: 83 },
  { slug: "schiele", qid: "Q44032", expected: 163 },
  { slug: "modigliani", qid: "Q120993", expected: 576 },
  { slug: "matisse", qid: "Q5589", expected: 494 },
  { slug: "kandinsky", qid: "Q61064", expected: 453 },
  { slug: "mondrian", qid: "Q151803", expected: 586 },
];
