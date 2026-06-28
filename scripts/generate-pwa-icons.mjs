import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public");
const svg = fs.readFileSync(path.join(root, "icon.svg"));

const sizes = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const { file, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(path.join(root, file));
  console.log(`Wrote ${file} (${size}x${size})`);
}
