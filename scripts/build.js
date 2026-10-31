// scripts/build.js - React + Tailwind CSS v4 + Official shadcn/ui (base-nova) Bundler for Ziga Xiangqi Extension
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const postcss = require('postcss');
const tailwindcssPostcss = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const srcStylesDir = path.join(rootDir, 'src', 'styles');
const baseOverlayPath = path.join(srcStylesDir, 'base_overlay.css');
const tailwindInputPath = path.join(srcStylesDir, 'tailwind.css');
const outStylesCss = path.join(rootDir, 'styles', 'overlay.css');
const outRootCss = path.join(rootDir, 'overlay.css');
const outDistJs = path.join(distDir, 'injected.js');
const outRootJs = path.join(rootDir, 'injected.js');

async function buildCss() {
  if (!fs.existsSync(srcStylesDir)) {
    fs.mkdirSync(srcStylesDir, { recursive: true });
  }
  if (!fs.existsSync(baseOverlayPath) && fs.existsSync(outStylesCss)) {
    fs.copyFileSync(outStylesCss, baseOverlayPath);
  }

  const baseCss = fs.existsSync(baseOverlayPath)
    ? fs.readFileSync(baseOverlayPath, 'utf8')
    : '';
  const twInput = fs.readFileSync(tailwindInputPath, 'utf8');

  const result = await postcss([
    tailwindcssPostcss({
      base: rootDir
    }),
    autoprefixer
  ]).process(twInput, {
    from: tailwindInputPath,
    to: outStylesCss
  });

  const combinedCss = `${baseCss}\n\n/* ===== Compiled Tailwind CSS v4 & Official shadcn/ui (base-nova) ===== */\n${result.css}\n`;
  fs.writeFileSync(outStylesCss, combinedCss, 'utf8');
  fs.writeFileSync(outRootCss, combinedCss, 'utf8');
  console.log(
    `[Build CSS] Compiled base_overlay.css + Tailwind v4 + shadcn/ui (base-nova) into styles/overlay.css & overlay.css (${Buffer.byteLength(combinedCss)} bytes)`
  );
}

async function buildJs() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  await esbuild.build({
    bundle: true,
    format: 'iife',
    target: ['chrome105'],
    jsx: 'automatic',
    loader: {
      '.js': 'jsx',
      '.jsx': 'jsx'
    },
    alias: {
      '@': path.join(rootDir, 'src'),
      'cn': path.join(rootDir, 'src', 'lib', 'utils.js')
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    entryPoints: [path.join(rootDir, 'src', 'index.js')],
    outfile: outDistJs,
    logLevel: 'warning'
  });

  fs.copyFileSync(outDistJs, outRootJs);
  const size = fs.statSync(outDistJs).size;
  console.log(
    `[Build JS] Successfully bundled React + Official shadcn/ui (base-nova) + Tailwind v4 into dist/injected.js & injected.js (${size} bytes)`
  );
}

async function main() {
  try {
    await buildCss();
    await buildJs();
  } catch (err) {
    console.error('[Build Error]', err);
    process.exit(1);
  }
}

main();
