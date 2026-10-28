// scripts/generate_auras.js - Pure Node.js PNG Generator for Custom Chess Auras
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table & calculator for valid PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function createPng(width, height, rgbaBuffer) {
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk: add filter byte 0 (None) to each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rawOffset = y * scanlineLength;
    rawData[rawOffset] = 0; // filter type 0
    rgbaBuffer.copy(rawData, rawOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure output directory exists
const outDir = path.join(__dirname, '..', 'icons', 'auras');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const SIZE = 256;
const CENTER = SIZE / 2;
const R_RING = SIZE * 0.42; // Radius ~107.5px

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// 1. MẪU 1: VÒNG RỒNG VÀNG HOÀNG KIM (GOLDEN DRAGON AURA)
function renderGoldenDragon() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      // Base ring distance
      const dRing = Math.abs(dist - R_RING);

      // Dragon wave / scale motif (12 lobes)
      const dragonPattern = Math.sin(angle * 12) * 3.5;
      const dDragon = Math.abs(dist - (R_RING + dragonPattern));

      // 8 Dragon jewel pearls along the ring
      let pearlIntensity = 0;
      for (let p = 0; p < 8; p++) {
        const pAngle = (p * Math.PI) / 4;
        const px = CENTER + Math.cos(pAngle) * R_RING;
        const py = CENTER + Math.sin(pAngle) * R_RING;
        const pDist = Math.hypot(x - px, y - py);
        if (pDist < 9) {
          pearlIntensity = Math.max(pearlIntensity, (1 - pDist / 9) * 1.5);
        }
      }

      // Outer glow bloom
      const bloom = clamp(1 - dRing / 18, 0, 1);
      // Sharp core line
      const sharp = clamp(1 - dRing / 3.5, 0, 1);
      const dragonLine = clamp(1 - dDragon / 3.0, 0, 1);

      const alpha = clamp(bloom * 0.45 + sharp * 0.85 + dragonLine * 0.7 + pearlIntensity, 0, 1);

      if (alpha > 0.02) {
        // Gold color palette (Golden yellow with white highlights)
        const r = Math.round(clamp(255, 0, 255));
        const g = Math.round(clamp(200 + sharp * 45 + pearlIntensity * 50, 0, 255));
        const b = Math.round(clamp(20 + sharp * 120 + pearlIntensity * 180, 0, 255));

        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }

  return buf;
}

// 2. MẪU 2: VÒNG TRẬN PHÁP BĂNG TUYẾT (FROST MAGIC ARRAY)
function renderFrostMagic() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dRing = Math.abs(dist - R_RING);
      const dInnerRing = Math.abs(dist - (R_RING - 6));

      // 6-star magic geometry lines
      const starRays = Math.pow(Math.abs(Math.sin(angle * 3)), 16);
      const dRays = (dist > R_RING - 14 && dist < R_RING + 14) ? starRays : 0;

      // 12 Frost runes dots
      const runes = Math.pow(Math.cos(angle * 12), 24);
      const dRunes = (dist > R_RING - 4 && dist < R_RING + 4) ? runes : 0;

      const bloom = clamp(1 - dRing / 16, 0, 1);
      const sharp = clamp(1 - dRing / 3, 0, 1);
      const innerSharp = clamp(1 - dInnerRing / 2, 0, 1);

      const alpha = clamp(bloom * 0.4 + sharp * 0.8 + innerSharp * 0.5 + dRays * 0.85 + dRunes * 1.2, 0, 1);

      if (alpha > 0.02) {
        // Cyan Frost color palette (#00e5ff / Ice White)
        const r = Math.round(clamp(sharp * 120 + dRunes * 200, 0, 255));
        const g = Math.round(clamp(220 + sharp * 35, 0, 255));
        const b = 255;

        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }

  return buf;
}

// 3. MẪU 3: VÒNG HỎA DIỆM ĐỊA NGỤC (INFERNO CRIMSON FLAME)
function renderInfernoFlame() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      // Flame tongue ripples (16 flame peaks outwards)
      const flameWiggle = Math.sin(angle * 16) * 4.5 + Math.cos(angle * 32) * 2;
      const flameRadius = R_RING + Math.max(0, flameWiggle);
      const dFlame = Math.abs(dist - flameRadius);
      const dRing = Math.abs(dist - R_RING);

      const bloom = clamp(1 - dRing / 18, 0, 1);
      const sharp = clamp(1 - dFlame / 3.5, 0, 1);
      const core = clamp(1 - dRing / 2.5, 0, 1);

      const alpha = clamp(bloom * 0.45 + sharp * 0.85 + core * 0.9, 0, 1);

      if (alpha > 0.02) {
        // Flame palette: Red Crimson (#ff1744) -> Flame Orange (#ff9100) -> White Core
        const r = 255;
        const g = Math.round(clamp(core * 200 + sharp * 70, 0, 255));
        const b = Math.round(clamp(core * 120, 0, 255));

        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }

  return buf;
}

// 4. MẪU 4: VÒNG KIM LIÊN NGỌC BÍCH (JADE LOTUS AURA - JJ STREAM STYLE)
function renderJadeLotus() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      // 8 Lotus Petal waves
      const lotusPetal = Math.sin(angle * 8) * 3.5;
      const dLotus = Math.abs(dist - (R_RING + lotusPetal));
      const dRing = Math.abs(dist - R_RING);

      const bloom = clamp(1 - dRing / 18, 0, 1);
      const sharp = clamp(1 - dRing / 3.2, 0, 1);
      const petalSharp = clamp(1 - dLotus / 2.8, 0, 1);

      const alpha = clamp(bloom * 0.45 + sharp * 0.9 + petalSharp * 0.7, 0, 1);

      if (alpha > 0.02) {
        // Lime Jade palette (#39ff14 / Emerald Neon)
        const r = Math.round(clamp(57 + sharp * 140, 0, 255));
        const g = 255;
        const b = Math.round(clamp(20 + sharp * 160, 0, 255));

        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }

  return buf;
}

// 5. MẪU 5: VÒNG LÔI ĐIỆN CYBERPUNK (CYBER LIGHTNING PURPLE)
function renderCyberLightning() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dRing = Math.abs(dist - R_RING);
      // Angular tech notches (16 circuit steps)
      const notch = Math.cos(angle * 16) > 0.7 ? 4 : 0;
      const dNotchRing = Math.abs(dist - (R_RING + notch));

      const bloom = clamp(1 - dRing / 17, 0, 1);
      const sharp = clamp(1 - dRing / 3.0, 0, 1);
      const notchLine = clamp(1 - dNotchRing / 2.2, 0, 1);

      const alpha = clamp(bloom * 0.4 + sharp * 0.85 + notchLine * 0.75, 0, 1);

      if (alpha > 0.02) {
        // Neon Purple / Amethyst (#d500f9 / Cyan spark)
        const r = Math.round(clamp(213 + sharp * 42, 0, 255));
        const g = Math.round(clamp(notchLine * 220 + sharp * 40, 0, 255));
        const b = 255;

        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }

  return buf;
}

const templates = [
  { name: 'aura_golden_dragon.png', title: 'Vòng Rồng Vàng Hoàng Kim', render: renderGoldenDragon },
  { name: 'aura_frost_magic.png', title: 'Vòng Trận Pháp Băng Tuyết', render: renderFrostMagic },
  { name: 'aura_inferno_flame.png', title: 'Vòng Hỏa Diệm Địa Ngục', render: renderInfernoFlame },
  { name: 'aura_jade_lotus.png', title: 'Vòng Kim Liên Ngọc Bích', render: renderJadeLotus },
  { name: 'aura_cyber_purple.png', title: 'Vòng Lôi Điện Cyberpunk', render: renderCyberLightning }
];

console.log('[Generate] Rendering 5 custom chess aura PNG templates (256x256 Transparent)...');

const exportData = [];

templates.forEach(t => {
  const filePath = path.join(outDir, t.name);
  const rgba = t.render();
  const pngData = createPng(SIZE, SIZE, rgba);
  fs.writeFileSync(filePath, pngData);
  const base64 = 'data:image/png;base64,' + pngData.toString('base64');
  exportData.push({
    id: t.name.replace('.png', ''),
    file: t.name,
    title: t.title,
    base64: base64
  });
  console.log(`[Success] Created ${t.name} (${pngData.length} bytes)`);
});

// Also output a JSON file containing the base64 data for 1-click preset usage in UI
const jsonPath = path.join(outDir, 'preset_auras.json');
fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`[Success] Generated preset_auras.json (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);
