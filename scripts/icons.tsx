/**
 * App-ийн icon-уудыг «Одтой шөнө»-ийн эргэлдэх хэсгээс үүсгэнэ.
 *
 *   bun run icons
 *
 * Гаралт: `public/icons/*.png` (repo-д commit хийнэ).
 *
 * Яагаад script вэ: `sharp` нь `ignoreScripts`-д байгаа тул зураг боловсруулах
 * сан ашиглах боломжгүй. Next-д багтсан `next/og` (Satori) ашиглав — шинэ
 * dependency нэмэхгүй. Route handler хийвэл `cacheComponents` үед статик
 * болдоггүй (`use cache` нь `Response` класс буцаахыг зөвшөөрдөггүй) тул
 * нэг удаа PNG болгож хөлдөөх нь зөв: build хурдан, runtime логикгүй,
 * service worker кэшлэхэд хялбар.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og";
import { commons } from "../lib/data/types";

const OUT_DIR = fileURLToPath(new URL("../public/icons", import.meta.url));
const SOURCE = commons("Van Gogh - Starry Night - Google Art Project.jpg", 1280);

/** Зургийн харьцаа (өргөн / өндөр) — харвестээс мэдэгдэж буй утга */
const ASPECT = 1.2628;

/** Зургийг хэдэн дахин томруулах, аль цэгийг төвд нь авчрахыг тодорхойлно */
const ZOOM = 2.4;
const FOCUS_X = 0.5;
const FOCUS_Y = 0.38;

type IconSpec = {
  file: string;
  size: number;
  /** Маскны safe zone-д зориулсан захын зай (дүрсийн эзлэхүүний хувь) */
  pad: number;
};

const ICONS: IconSpec[] = [
  { file: "icon-192.png", size: 192, pad: 0 },
  { file: "icon-512.png", size: 512, pad: 0 },
  // Android maskable icon-ыг дугуй хэлбэрээр хайчилдаг тул захаас нь 10%
  // хасагдана — дүрсийг жижигрүүлж, эргэн тойрон хар зай үлдээнэ.
  { file: "icon-maskable-512.png", size: 512, pad: 0.1 },
  { file: "apple-touch-icon.png", size: 180, pad: 0 },
];

async function render({ size, pad }: IconSpec): Promise<Uint8Array> {
  // Хайчлах цонх: pad-ыг хасаад үлдсэн дөрвөлжин
  const inner = Math.round(size * (1 - pad * 2));
  const offset = Math.round((size - inner) / 2);

  // Зургийг цонхноос томоор байрлуулж, фокусын цэгийг төвд нь авчирна
  const imgW = Math.round(inner * ZOOM * ASPECT);
  const imgH = Math.round(imgW / ASPECT);
  const left = Math.round(inner / 2 - imgW * FOCUS_X);
  const top = Math.round(inner / 2 - imgH * FOCUS_Y);

  const response = new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", background: "#0d0c0a" }}>
        <div
          style={{
            position: "absolute",
            left: offset,
            top: offset,
            width: inner,
            height: inner,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <img src={SOURCE} alt="" width={imgW} height={imgH} style={{ position: "absolute", left, top }} />
        </div>
      </div>
    ),
    { width: size, height: size },
  );

  return new Uint8Array(await response.arrayBuffer());
}

await mkdir(OUT_DIR, { recursive: true });

console.log(`\nIcon үүсгэж байна — эх сурвалж: «Одтой шөнө»\n`);

for (const spec of ICONS) {
  const png = await render(spec);
  await writeFile(`${OUT_DIR}/${spec.file}`, png);
  console.log(`  ✓ ${spec.file.padEnd(24)} ${spec.size}×${spec.size}  ${(png.byteLength / 1024).toFixed(0)}KB`);
}

console.log();
