// scripts/generate_auras.js - Pure Node.js PNG Generator & Enhancer for Custom Chess Auras
// Generates 10 procedural high-detail 256x256 PNGs + enhances & bundles the 12 Aura_Op_01..12 PNGs
// into icons/auras/preset_auras.json and src/aura/aura_presets.js
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
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rawOffset = y * scanlineLength;
    rawData[rawOffset] = 0;
    rgbaBuffer.copy(rawData, rawOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 8, width = 0, height = 0, colorType = 6;
  const idats = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const data = buf.slice(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') idats.push(data);
    else if (type === 'IEND') break;
    offset += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp + 1;
  const recon = Buffer.alloc(height * width * bpp);
  function paeth(a, b, c) {
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
  }
  for (let y = 0; y < height; y++) {
    const f = raw[y * stride];
    for (let x = 0; x < width * bpp; x++) {
      const b0 = raw[y * stride + 1 + x];
      const a = x >= bpp ? recon[y * width * bpp + x - bpp] : 0;
      const b = y > 0 ? recon[(y - 1) * width * bpp + x] : 0;
      const c = (x >= bpp && y > 0) ? recon[(y - 1) * width * bpp + x - bpp] : 0;
      let v = b0;
      if (f === 1) v = (b0 + a) & 0xff;
      else if (f === 2) v = (b0 + b) & 0xff;
      else if (f === 3) v = (b0 + ((a + b) >> 1)) & 0xff;
      else if (f === 4) v = (b0 + paeth(a, b, c)) & 0xff;
      recon[y * width * bpp + x] = v;
    }
  }
  if (bpp === 4) return { width, height, pixels: recon };
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = recon[i * 3];
    rgba[i * 4 + 1] = recon[i * 3 + 1];
    rgba[i * 4 + 2] = recon[i * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
  return { width, height, pixels: rgba };
}

function sampleBilinear(pixels, w, h, fx, fy) {
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
  const dx = fx - x0, dy = fy - y0;
  const cx0 = Math.max(0, Math.min(w - 1, x0));
  const cy0 = Math.max(0, Math.min(h - 1, y0));
  const out = [0, 0, 0, 0];
  for (let c = 0; c < 4; c++) {
    const v00 = pixels[(cy0 * w + cx0) * 4 + c];
    const v10 = pixels[(cy0 * w + x1) * 4 + c];
    const v01 = pixels[(y1 * w + cx0) * 4 + c];
    const v11 = pixels[(y1 * w + x1) * 4 + c];
    const top = v00 * (1 - dx) + v10 * dx;
    const bot = v01 * (1 - dx) + v11 * dx;
    out[c] = top * (1 - dy) + bot * dy;
  }
  return out;
}

// Detect inner radius of an existing aura image to avoid double-remapping if run multiple times
function detectInnerRadius(pixels, w, h) {
  const cx = w / 2, cy = h / 2;
  for (let r = 40; r < 110; r += 2) {
    let sumA = 0, cnt = 0;
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = deg * Math.PI / 180;
      const x = Math.round(cx + Math.cos(rad) * r);
      const y = Math.round(cy + Math.sin(rad) * r);
      sumA += pixels[(y * w + x) * 4 + 3];
      cnt++;
    }
    if (sumA / cnt > 35) return r;
  }
  return 70;
}

function enhanceOpAuraIfNeeded(srcPixels, w, h) {
  const currentInnerR = detectInnerRadius(srcPixels, w, h);
  // If already enhanced (inner radius >= 80), return as-is so script is idempotent
  if (currentInnerR >= 80) {
    return srcPixels;
  }

  const cx = w / 2, cy = h / 2;
  const remapped = Buffer.alloc(w * h * 4);
  const targetInner = 82;
  const targetOuter = 126;
  const srcInner = 62;
  const srcOuter = 125;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy;
      const r = Math.hypot(dx, dy);
      if (r < targetInner - 6 || r > targetOuter) continue;

      let srcR;
      if (r < targetInner) {
        const t = (r - (targetInner - 6)) / 6;
        srcR = (srcInner - 6) + t * 6;
      } else {
        const t = (r - targetInner) / (targetOuter - targetInner);
        srcR = srcInner + Math.pow(t, 0.95) * (srcOuter - srcInner);
      }

      const angle = Math.atan2(dy, dx);
      const sx = cx + Math.cos(angle) * srcR;
      const sy = cy + Math.sin(angle) * srcR;
      const rgba = sampleBilinear(srcPixels, w, h, sx, sy);

      let innerFade = 1.0;
      if (r < targetInner + 2) {
        innerFade = Math.max(0, Math.min(1, (r - (targetInner - 4)) / 6));
      }
      let outerFade = 1.0;
      if (r > 121) {
        outerFade = Math.max(0, Math.min(1, (126.5 - r) / 5.5));
      }

      const idx = (y * w + x) * 4;
      remapped[idx] = Math.round(rgba[0]);
      remapped[idx + 1] = Math.round(rgba[1]);
      remapped[idx + 2] = Math.round(rgba[2]);
      remapped[idx + 3] = Math.round(rgba[3] * innerFade * outerFade);
    }
  }

  // Unsharp mask for crisp runes and edges + vibrant alpha
  const out = Buffer.alloc(w * h * 4);
  const amount = 0.5;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const a = remapped[idx + 3];
      if (a === 0) continue;

      for (let c = 0; c < 3; c++) {
        const center = remapped[idx + c];
        const blur = (
          remapped[((y - 1) * w + x) * 4 + c] +
          remapped[((y + 1) * w + x) * 4 + c] +
          remapped[(y * w + (x - 1)) * 4 + c] +
          remapped[(y * w + (x + 1)) * 4 + c]
        ) * 0.25;
        const sharp = center + (center - blur) * amount;
        out[idx + c] = Math.max(0, Math.min(255, Math.round(sharp * 1.03)));
      }
      const normA = a / 255;
      const boostedA = Math.pow(normA, 0.86) * 255;
      out[idx + 3] = Math.max(0, Math.min(255, Math.round(boostedA)));
    }
  }

  return out;
}

const outDir = path.join(__dirname, '..', 'icons', 'auras');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const SIZE = 256;
const CENTER = SIZE / 2;
const R_INNER = 90;   // Inner rim hugging chess piece (diameter 180px = 70.3%)
const R_MID = 101;    // Main ornate rune band center
const R_OUTER = 112;  // Outer crest ring

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// 1. VÒNG RỒNG VÀNG HOÀNG KIM (GOLDEN DRAGON AURA - UPGRADED)
function renderGoldenDragon() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);
      const dOuter = Math.abs(dist - R_OUTER);

      // Intertwined twin dragon waves + scale lattice
      const wave1 = Math.sin(angle * 8 + 0.4) * 5.0;
      const wave2 = Math.cos(angle * 8 - 0.4) * 4.5;
      const dDragon1 = Math.abs(dist - (R_MID + wave1));
      const dDragon2 = Math.abs(dist - (R_MID + wave2));

      // Dragon scale texture inside band
      const inBand = (dist >= R_INNER && dist <= R_OUTER) ? 1 : 0;
      const scaleMesh = inBand * Math.pow(Math.abs(Math.sin(angle * 24 + (dist - R_INNER) * 0.45)), 6) * 0.55;

      // 8 Imperial Dragon Pearls with star flares
      let pearl = 0;
      for (let p = 0; p < 8; p++) {
        const pa = (p * Math.PI) / 4;
        const px = CENTER + Math.cos(pa) * R_MID;
        const py = CENTER + Math.sin(pa) * R_MID;
        const pd = Math.hypot(x - px, y - py);
        if (pd < 11) {
          pearl = Math.max(pearl, Math.pow(1 - pd / 11, 1.4) * 1.35);
        }
      }

      const bloom = clamp(1 - dMid / 20, 0, 1) * 0.45;
      const innerLine = clamp(1 - dInner / 2.2, 0, 1) * 0.9;
      const outerLine = clamp(1 - dOuter / 2.0, 0, 1) * 0.75;
      const body1 = clamp(1 - dDragon1 / 3.2, 0, 1) * 0.95;
      const body2 = clamp(1 - dDragon2 / 2.5, 0, 1) * 0.75;

      const core = Math.max(innerLine, outerLine, body1, body2);
      const alpha = clamp(bloom + core + scaleMesh + pearl, 0, 1);

      if (alpha > 0.015) {
        const bright = clamp(core * 0.6 + pearl * 0.9, 0, 1);
        buf[idx] = 255;
        buf[idx + 1] = Math.round(clamp(185 + bright * 70, 0, 255));
        buf[idx + 2] = Math.round(clamp(15 + bright * 210, 0, 255));
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 2. VÒNG TRẬN PHÁP BĂNG TUYẾT (FROST MAGIC ARRAY - UPGRADED)
function renderFrostMagic() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);
      const dOuter = Math.abs(dist - R_OUTER);

      // 12-point ice crystal crown
      const crownOffset = Math.pow(Math.abs(Math.cos(angle * 6)), 3) * 8;
      const dCrown = Math.abs(dist - (R_MID + crownOffset - 2));

      // Arcane frost runes inside track
      const inTrack = (dist > R_INNER + 2 && dist < R_OUTER - 2);
      const runeGlyph = inTrack ? Math.pow(Math.abs(Math.sin(angle * 18) * Math.cos((dist - R_MID) * 0.65)), 4) * 0.85 : 0;

      // 6 Cardinal Ice Diamonds
      let crystal = 0;
      for (let k = 0; k < 6; k++) {
        const ca = (k * Math.PI) / 3;
        const cx = CENTER + Math.cos(ca) * R_MID;
        const cy = CENTER + Math.sin(ca) * R_MID;
        // Manhattan distance rotated for diamond shape
        const rdx = Math.abs((x - cx) * Math.cos(ca) + (y - cy) * Math.sin(ca));
        const rdy = Math.abs(-(x - cx) * Math.sin(ca) + (y - cy) * Math.cos(ca));
        const dDia = rdx * 0.7 + rdy * 1.2;
        if (dDia < 9) {
          crystal = Math.max(crystal, (1 - dDia / 9) * 1.3);
        }
      }

      const bloom = clamp(1 - dMid / 20, 0, 1) * 0.45;
      const l1 = clamp(1 - dInner / 2.2, 0, 1) * 0.9;
      const l2 = clamp(1 - dOuter / 2.0, 0, 1) * 0.8;
      const lCrown = clamp(1 - dCrown / 2.6, 0, 1) * 0.9;

      const sharp = Math.max(l1, l2, lCrown);
      const alpha = clamp(bloom + sharp + runeGlyph + crystal, 0, 1);

      if (alpha > 0.015) {
        const white = clamp(sharp * 0.55 + crystal * 0.95 + runeGlyph * 0.4, 0, 1);
        buf[idx] = Math.round(clamp(10 + white * 235, 0, 255));
        buf[idx + 1] = Math.round(clamp(195 + white * 60, 0, 255));
        buf[idx + 2] = 255;
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 3. VÒNG HỎA DIỆM ĐỊA NGỤC (INFERNO CRIMSON FLAME - UPGRADED)
function renderInfernoFlame() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);

      // Sweeping directional fire blades (12 tongues)
      const saw = ((angle * 12) / (2 * Math.PI)) % 1;
      const normSaw = saw < 0 ? saw + 1 : saw;
      const flameCurve = Math.sin(normSaw * Math.PI) * 11 + Math.sin(angle * 24) * 2.5;
      const dFlameOuter = Math.abs(dist - (R_INNER + 4 + Math.max(0, flameCurve)));
      const dFlameInner = Math.abs(dist - (R_INNER + 2 + Math.max(0, flameCurve * 0.55)));

      const bloom = clamp(1 - dMid / 21, 0, 1) * 0.5;
      const innerCore = clamp(1 - dInner / 2.6, 0, 1);
      const flame1 = clamp(1 - dFlameOuter / 3.2, 0, 1) * 0.92;
      const flame2 = clamp(1 - dFlameInner / 2.6, 0, 1) * 0.85;

      // Lava embers inside ring
      const ember = (dist > R_INNER && dist < R_OUTER + 4)
        ? Math.pow(Math.max(0, Math.cos(angle * 12 + dist * 0.25)), 10) * 0.75
        : 0;

      const alpha = clamp(bloom + Math.max(innerCore, flame1, flame2) + ember, 0, 1);

      if (alpha > 0.015) {
        const heat = clamp(innerCore * 0.85 + flame2 * 0.65 + ember * 0.8, 0, 1);
        buf[idx] = 255;
        buf[idx + 1] = Math.round(clamp(20 + heat * 215, 0, 255));
        buf[idx + 2] = Math.round(clamp(heat * heat * 165, 0, 255));
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 4. VÒNG KIM LIÊN NGỌC BÍCH (JADE LOTUS AURA - UPGRADED)
function renderJadeLotus() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);

      // Double-layer 8 & 16 Lotus Petals
      const petalOuter = Math.abs(Math.sin(angle * 4)) * 11 + 2;
      const petalInner = Math.abs(Math.cos(angle * 4)) * 7 + 1;
      const dPetal1 = Math.abs(dist - (R_INNER + petalOuter));
      const dPetal2 = Math.abs(dist - (R_INNER + petalInner));

      // Glowing Jade Seeds at 8 lotus tips
      const seed = (dist > R_MID - 4 && dist < R_MID + 8)
        ? Math.pow(Math.abs(Math.sin(angle * 4)), 24) * 1.1
        : 0;

      const bloom = clamp(1 - dMid / 20, 0, 1) * 0.45;
      const baseRing = clamp(1 - dInner / 2.5, 0, 1) * 0.95;
      const p1 = clamp(1 - dPetal1 / 2.8, 0, 1) * 0.9;
      const p2 = clamp(1 - dPetal2 / 2.4, 0, 1) * 0.8;

      const sharp = Math.max(baseRing, p1, p2);
      const alpha = clamp(bloom + sharp + seed, 0, 1);

      if (alpha > 0.015) {
        const highlight = clamp(sharp * 0.55 + seed * 0.9, 0, 1);
        buf[idx] = Math.round(clamp(35 + highlight * 185, 0, 255));
        buf[idx + 1] = 255;
        buf[idx + 2] = Math.round(clamp(70 + highlight * 155, 0, 255));
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 5. VÒNG LÔI ĐIỆN CYBERPUNK (CYBER LIGHTNING PURPLE - UPGRADED)
function renderCyberLightning() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);
      const dOuter = Math.abs(dist - R_OUTER);

      // Segmented futuristic tech armor + high-frequency lightning arcs
      const techGear = Math.cos(angle * 12) > 0.35 ? 6 : -2;
      const dTech = Math.abs(dist - (R_MID + techGear));

      const bolt = Math.sin(angle * 10) * 4 + Math.cos(angle * 30) * 2.5;
      const dBolt = Math.abs(dist - (R_MID + bolt));

      const bloom = clamp(1 - dMid / 20, 0, 1) * 0.45;
      const innerLine = clamp(1 - dInner / 2.2, 0, 1) * 0.9;
      const techLine = clamp(1 - dTech / 2.5, 0, 1) * 0.85;
      const boltLine = clamp(1 - dBolt / 2.2, 0, 1) * 0.95;
      const outerDash = (Math.cos(angle * 24) > 0) ? clamp(1 - dOuter / 2.0, 0, 1) * 0.7 : 0;

      const alpha = clamp(bloom + Math.max(innerLine, techLine, boltLine, outerDash), 0, 1);

      if (alpha > 0.015) {
        // Neon Purple-Magenta with Electric Cyan lightning core
        const isCyanSpark = boltLine > 0.6;
        buf[idx] = Math.round(clamp(isCyanSpark ? 140 + boltLine * 115 : 210 + innerLine * 45, 0, 255));
        buf[idx + 1] = Math.round(clamp(isCyanSpark ? 220 : 25 + techLine * 120, 0, 255));
        buf[idx + 2] = 255;
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 6. NEW MẪU 6: HUYẾT NGUYỆT SÁT TINH (BLOOD MOON ECLIPSE)
function renderBloodMoon() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);
      const dOuter = Math.abs(dist - R_OUTER);

      // 4 Crescent scythe blades around the blood moon ring
      const scythe = Math.pow(Math.abs(Math.sin(angle * 2)), 2.2) * 10;
      const dScythe = Math.abs(dist - (R_INNER + 3 + scythe));

      // 8 Blood thorn spikes pointing outward
      const spike = Math.pow(Math.max(0, Math.cos(angle * 8)), 16) * 12;
      const dSpike = (dist >= R_INNER && dist <= R_OUTER + spike) ? Math.pow(Math.max(0, Math.cos(angle * 8)), 18) : 0;

      const bloom = clamp(1 - dMid / 21, 0, 1) * 0.48;
      const innerRim = clamp(1 - dInner / 2.5, 0, 1) * 0.95;
      const scytheLine = clamp(1 - dScythe / 3.0, 0, 1) * 0.9;
      const outerRim = clamp(1 - dOuter / 1.8, 0, 1) * 0.65;

      const sharp = Math.max(innerRim, scytheLine, outerRim, dSpike);
      const alpha = clamp(bloom + sharp, 0, 1);

      if (alpha > 0.015) {
        const core = clamp(innerRim * 0.7 + dSpike * 0.9, 0, 1);
        buf[idx] = 255;
        buf[idx + 1] = Math.round(clamp(10 + core * 145, 0, 255));
        buf[idx + 2] = Math.round(clamp(35 + core * 130, 0, 255));
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 7. NEW MẪU 7: BÁT QUÁI THIÊN TINH TRẬN (CELESTIAL BAGUA ARRAY)
function renderCelestialBagua() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      // Octagonal sacred geometry + circular inner ring
      const octAngle = ((angle + Math.PI) % (Math.PI / 4)) - (Math.PI / 8);
      const rOct = (R_OUTER - 2) / Math.cos(octAngle * 0.85);
      const dOct = Math.abs(dist - rOct);
      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);

      // Bagua trigram bars (3 concentric dashed rings divided into 8 sectors)
      const sectorGap = Math.abs(Math.sin(angle * 4)) > 0.22 ? 1 : 0;
      const bar1 = sectorGap * clamp(1 - Math.abs(dist - (R_INNER + 5)) / 1.6, 0, 1);
      const bar2 = sectorGap * (Math.cos(angle * 8) > -0.2 ? 1 : 0) * clamp(1 - Math.abs(dist - (R_INNER + 10)) / 1.6, 0, 1);
      const bar3 = sectorGap * clamp(1 - Math.abs(dist - (R_INNER + 15)) / 1.6, 0, 1);
      const trigrams = Math.max(bar1, bar2, bar3) * 0.9;

      const bloom = clamp(1 - dMid / 20, 0, 1) * 0.42;
      const lInner = clamp(1 - dInner / 2.4, 0, 1) * 0.95;
      const lOct = clamp(1 - dOct / 2.4, 0, 1) * 0.9;

      const sharp = Math.max(lInner, lOct, trigrams);
      const alpha = clamp(bloom + sharp, 0, 1);

      if (alpha > 0.015) {
        // Rich Imperial Amber-Gold & Bronze-Orange contrast so trigrams pop vividly
        const isTrigram = trigrams > 0.45;
        buf[idx] = 255;
        buf[idx + 1] = Math.round(clamp(isTrigram ? 235 : 145 + sharp * 85, 0, 255));
        buf[idx + 2] = Math.round(clamp(isTrigram ? 90 : 10 + sharp * 55, 0, 255));
        buf[idx + 3] = Math.round(clamp(alpha * 1.15, 0, 1) * 255);
      }
    }
  }
  return buf;
}

// 8. NEW MẪU 8: BÍCH PHƯỢNG VŨ THIÊN (EMERALD PHOENIX WINGS)
function renderEmeraldPhoenix() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);

      // Feathered phoenix plumes sweeping around the ring
      const feather = Math.sin(angle * 10 - (dist - R_INNER) * 0.25) * 4.5;
      const dFeather = Math.abs(dist - (R_MID + feather));
      const plume = (dist >= R_INNER && dist <= R_OUTER + 4)
        ? Math.pow(Math.max(0, Math.sin(angle * 16 - (dist - R_INNER) * 0.35)), 6) * 0.85
        : 0;

      const bloom = clamp(1 - dMid / 20, 0, 1) * 0.45;
      const innerRim = clamp(1 - dInner / 2.4, 0, 1) * 0.95;
      const featherLine = clamp(1 - dFeather / 2.6, 0, 1) * 0.9;

      const sharp = Math.max(innerRim, featherLine, plume);
      const alpha = clamp(bloom + sharp, 0, 1);

      if (alpha > 0.015) {
        // Turquoise-Emerald with Golden-White feather tips
        const tip = clamp((dist - R_INNER) / 24, 0, 1);
        buf[idx] = Math.round(clamp(20 + tip * 180 + innerRim * 90, 0, 255));
        buf[idx + 1] = 255;
        buf[idx + 2] = Math.round(clamp(165 - tip * 60 + innerRim * 70, 0, 255));
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 9. NEW MẪU 9: TINH VÂN HƯ KHÔNG (VOID GALAXY VORTEX)
function renderVoidGalaxy() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);

      // 4 Spiral galaxy arms wrapping around the ring
      const spiralPhase = angle * 4 - (dist - R_INNER) * 0.22;
      const spiralArm = (dist >= R_INNER - 2 && dist <= R_OUTER + 6)
        ? Math.pow(0.5 + 0.5 * Math.cos(spiralPhase), 5) * smoothstep(125, 108, dist) * smoothstep(R_INNER - 4, R_INNER + 4, dist)
        : 0;

      // Starlight particles
      const star = (dist > R_INNER + 2 && dist < R_OUTER + 4)
        ? Math.pow(Math.max(0, Math.sin(angle * 20) * Math.cos(dist * 0.7)), 16) * 1.2
        : 0;

      const bloom = clamp(1 - dMid / 21, 0, 1) * 0.45;
      const innerHorizon = clamp(1 - dInner / 2.4, 0, 1) * 0.95;

      const alpha = clamp(bloom + Math.max(innerHorizon, spiralArm * 0.95) + star, 0, 1);

      if (alpha > 0.015) {
        const t = clamp(spiralArm, 0, 1);
        buf[idx] = Math.round(clamp(130 + t * 110 + star * 125, 0, 255));
        buf[idx + 1] = Math.round(clamp(40 + innerHorizon * 180 + star * 200, 0, 255));
        buf[idx + 2] = 255;
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 10. NEW MẪU 10: HUYẾT KIẾM CHIẾN THẦN (CRIMSON SAMURAI BLADE)
function renderCrimsonSamurai() {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CENTER, dy = y - CENTER;
      const dist = Math.hypot(dx, dy);
      if (dist < R_INNER - 8 || dist > 126) continue;
      const angle = Math.atan2(dy, dx);
      const idx = (y * SIZE + x) * 4;

      const dInner = Math.abs(dist - R_INNER);
      const dMid = Math.abs(dist - R_MID);
      const dOuter = Math.abs(dist - R_OUTER);

      // 4 Crossed Katana blade arcs + 8 War crests
      const bladeArc = Math.abs(Math.sin(angle * 2)) * 9;
      const dBlade = Math.abs(dist - (R_INNER + 3 + bladeArc));
      const crest = (dist >= R_INNER && dist <= R_OUTER + 3)
        ? Math.pow(Math.abs(Math.cos(angle * 4)), 20) * 1.1
        : 0;

      const bloom = clamp(1 - dMid / 20, 0, 1) * 0.45;
      const lInner = clamp(1 - dInner / 2.4, 0, 1) * 0.95;
      const lBlade = clamp(1 - dBlade / 2.6, 0, 1) * 0.92;
      const lOuter = clamp(1 - dOuter / 2.0, 0, 1) * 0.75;

      const sharp = Math.max(lInner, lBlade, lOuter, crest);
      const alpha = clamp(bloom + sharp, 0, 1);

      if (alpha > 0.015) {
        // Crimson Red with Golden-White Katana edge
        const goldEdge = clamp(lBlade * 0.75 + crest * 0.9, 0, 1);
        buf[idx] = 255;
        buf[idx + 1] = Math.round(clamp(15 + goldEdge * 205, 0, 255));
        buf[idx + 2] = Math.round(clamp(30 + goldEdge * 120, 0, 255));
        buf[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return buf;
}

// 1. Enhance & load the 12 new Aura_Op_01..12 PNG files
const opTemplates = [
  { id: 'Aura_Op_01', file: 'Aura_Op_01_256x256.png', title: 'Hàn Băng Long Vũ (Op 01)', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', isNew: true },
  { id: 'Aura_Op_02', file: 'Aura_Op_02_256x256.png', title: 'Liệt Hỏa Cổ Phù Văn (Op 02)', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', isNew: true },
  { id: 'Aura_Op_03', file: 'Aura_Op_03_256x256.png', title: 'Thanh Long Lục Bảo (Op 03)', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', isNew: true },
  { id: 'Aura_Op_04', file: 'Aura_Op_04_256x256.png', title: 'Lục Diệp Ma Pháp Trận (Op 04)', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', isNew: true },
  { id: 'Aura_Op_05', file: 'Aura_Op_05_256x256.png', title: 'Kim Ô Hỏa Long Hoàn (Op 05)', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', isNew: true },
  { id: 'Aura_Op_06', file: 'Aura_Op_06_256x256.png', title: 'Cơ Giới Tinh Luân Lam (Op 06)', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', isNew: true },
  { id: 'Aura_Op_07', file: 'Aura_Op_07_256x256.png', title: 'Bát Giác Lục Tinh Trận (Op 07)', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', isNew: true },
  { id: 'Aura_Op_08', file: 'Aura_Op_08_256x256.png', title: 'Lõi Cơ Giới Hạt Nhân (Op 08)', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', isNew: true },
  { id: 'Aura_Op_09', file: 'Aura_Op_09_256x256.png', title: 'Thánh Ấn Viêm Hoàng (Op 09)', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', isNew: true },
  { id: 'Aura_Op_10', file: 'Aura_Op_10_256x256.png', title: 'Tử Lôi Huyền Pháp Trận (Op 10)', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', isNew: true },
  { id: 'Aura_Op_11', file: 'Aura_Op_11_256x256.png', title: 'Đế Vương Hoàng Kim Ấn (Op 11)', tag: 'Dùng Cả Hai Lượt', cat: 'both', isNew: true },
  { id: 'Aura_Op_12', file: 'Aura_Op_12_256x256.png', title: 'Huyết Vũ Hồng Liên (Op 12)', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', isNew: true }
];

// 2. Procedural high-definition templates (5 Upgraded Classics + 5 Brand New)
const proceduralTemplates = [
  { id: 'aura_golden_dragon', file: 'aura_golden_dragon.png', title: 'Vòng Rồng Vàng Hoàng Kim', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', render: renderGoldenDragon },
  { id: 'aura_frost_magic', file: 'aura_frost_magic.png', title: 'Vòng Trận Pháp Băng Tuyết', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', render: renderFrostMagic },
  { id: 'aura_inferno_flame', file: 'aura_inferno_flame.png', title: 'Vòng Hỏa Diệm Địa Ngục', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', render: renderInfernoFlame },
  { id: 'aura_jade_lotus', file: 'aura_jade_lotus.png', title: 'Vòng Kim Liên Ngọc Bích', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', render: renderJadeLotus },
  { id: 'aura_cyber_purple', file: 'aura_cyber_purple.png', title: 'Vòng Lôi Điện Cyberpunk', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', render: renderCyberLightning },
  { id: 'aura_blood_moon', file: 'aura_blood_moon.png', title: 'Huyết Nguyệt Sát Tinh', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', isNew: true, render: renderBloodMoon },
  { id: 'aura_celestial_bagua', file: 'aura_celestial_bagua.png', title: 'Bát Quái Thiên Tinh Trận', tag: 'Dùng Cả Hai Lượt', cat: 'both', isNew: true, render: renderCelestialBagua },
  { id: 'aura_emerald_phoenix', file: 'aura_emerald_phoenix.png', title: 'Bích Phượng Vũ Thiên', tag: 'Khuyên dùng Lượt Tôi', cat: 'my', isNew: true, render: renderEmeraldPhoenix },
  { id: 'aura_void_galaxy', file: 'aura_void_galaxy.png', title: 'Tinh Vân Hư Không', tag: 'Dùng Cả Hai Lượt', cat: 'both', isNew: true, render: renderVoidGalaxy },
  { id: 'aura_crimson_samurai', file: 'aura_crimson_samurai.png', title: 'Huyết Kiếm Chiến Thần', tag: 'Khuyên dùng Đối Thủ', cat: 'opp', isNew: true, render: renderCrimsonSamurai }
];

const exportData = [];

console.log('[Generate] Processing 12 Aura_Op_01..12 PNGs + Rendering 10 Procedural HD Auras...');

opTemplates.forEach(item => {
  const filePath = path.join(outDir, item.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`[Skip] Missing ${item.file}`);
    return;
  }
  const { width, height, pixels } = decodePng(filePath);
  const enhancedPixels = enhanceOpAuraIfNeeded(pixels, width, height);
  const pngData = createPng(width, height, enhancedPixels);
  fs.writeFileSync(filePath, pngData);
  const base64 = 'data:image/png;base64,' + pngData.toString('base64');
  exportData.push({
    id: item.id,
    file: item.file,
    title: item.title,
    tag: item.tag,
    cat: item.cat,
    isNew: !!item.isNew,
    base64: base64
  });
  console.log(`[Enhanced Op] ${item.file} (${pngData.length} bytes)`);
});

proceduralTemplates.forEach(t => {
  const filePath = path.join(outDir, t.file);
  const rgba = t.render();
  const pngData = createPng(SIZE, SIZE, rgba);
  fs.writeFileSync(filePath, pngData);
  const base64 = 'data:image/png;base64,' + pngData.toString('base64');
  exportData.push({
    id: t.id,
    file: t.file,
    title: t.title,
    tag: t.tag,
    cat: t.cat,
    isNew: !!t.isNew,
    base64: base64
  });
  console.log(`[Generated HD] ${t.file} (${pngData.length} bytes)`);
});

// Write preset_auras.json
const jsonPath = path.join(outDir, 'preset_auras.json');
fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`[Success] Updated preset_auras.json (${exportData.length} presets)`);

// Write src/aura/aura_presets.js
const jsOutPath = path.join(__dirname, '..', 'src', 'aura', 'aura_presets.js');
const jsContent = `// src/aura/aura_presets.js - Built-in high-quality PNG Aura presets (${exportData.length} templates) for 1-click testing
(function (ZigaMod) {
  'use strict';

  ZigaMod.PRESET_AURAS = ${JSON.stringify(exportData, null, 2)};

})(window.ZigaMod = window.ZigaMod || {});
`;
fs.writeFileSync(jsOutPath, jsContent, 'utf8');
console.log(`[Success] Updated src/aura/aura_presets.js (${(fs.statSync(jsOutPath).size / 1024).toFixed(1)} KB)`);
