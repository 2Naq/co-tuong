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

const SCOPE_CONTAINER = ':is(#ziga-mod-widget, #ziga-mod-settings-modal, .ziga-shadcn-root, [data-slot], [data-base-ui-portal])';

function scopeSingleSelector(sel) {
  const trimmed = sel.trim();
  if (
    !trimmed ||
    trimmed.startsWith(':root') ||
    trimmed.startsWith(':host') ||
    trimmed.startsWith('.dark') ||
    trimmed.startsWith('body.') ||
    trimmed.startsWith('&') ||
    trimmed.includes('#ziga-mod-widget') ||
    trimmed.includes('#ziga-mod-settings-modal') ||
    trimmed.includes('.ziga-shadcn-root') ||
    trimmed.includes('[data-base-ui-portal]') ||
    trimmed.includes('[data-slot="popover-content"]') ||
    trimmed.includes('[data-slot="select-content"]') ||
    trimmed.includes('[data-slot="tooltip-content"]') ||
    trimmed.includes('[data-slot="dialog-content"]') ||
    trimmed.includes('[data-slot="dialog-overlay"]') ||
    trimmed.includes('::-webkit-scrollbar')
  ) {
    return trimmed;
  }

  // Handle pseudo-element (::before, ::after, ::placeholder, etc.)
  const pseudoElIdx = trimmed.indexOf('::');
  if (pseudoElIdx !== -1) {
    const base = trimmed.slice(0, pseudoElIdx);
    const pseudo = trimmed.slice(pseudoElIdx);
    return `${SCOPE_CONTAINER} ${base}${pseudo}, ${SCOPE_CONTAINER}${base}${pseudo}`;
  }

  return `${SCOPE_CONTAINER} ${trimmed}, ${SCOPE_CONTAINER}${trimmed}`;
}

/**
 * PostCSS plugin to completely isolate Tailwind v4 & shadcn/ui from host page Bootstrap (bootstrap.css) & ziga.css:
 * 1. Unwraps any @layer blocks so rules are never demoted below unlayered bootstrap.css.
 * 2. Injects explicit border-color: var(--border) on border-width utilities (.border, .border-b, .border-t, etc.)
 *    so bootstrap.css's `.border { border: 1px solid #dee2e6 !important; }` cannot leak #dee2e6 onto elements.
 * 3. Scopes all utility selectors with `:is(#ziga-mod-widget, .ziga-shadcn-root, .ziga-shadcn-root *, [data-slot], [data-slot] *)`
 *    giving every utility ID-level specificity (1,1,0)+ and preventing any leak onto zigavn.com.
 * 4. Marks utility declarations as !important so they always beat bootstrap.css's !important utilities.
 */
function isolateFromBootstrapPlugin() {
  return {
    postcssPlugin: 'isolate-from-bootstrap',
    OnceExit(root) {
      // 1. Unwrap @layer rules
      root.walkAtRules('layer', (atRule) => {
        if (atRule.nodes && atRule.nodes.length > 0) {
          atRule.replaceWith(atRule.nodes);
        } else {
          atRule.remove();
        }
      });

      // 2. Scope and escalate specificity + !important on utility rules
      root.walkRules((rule) => {
        // Skip @keyframes stops
        let p = rule.parent;
        let inKeyframes = false;
        let inNestedRule = false;
        while (p) {
          if (p.type === 'atrule' && p.name && p.name.endsWith('keyframes')) {
            inKeyframes = true;
            break;
          }
          if (p.type === 'rule') {
            inNestedRule = true;
          }
          p = p.parent;
        }
        if (inKeyframes) return;

        const rawSelector = rule.selector || '';
        const isPreflightOrTheme =
          rawSelector.startsWith(':is(.ziga-shadcn-root, [data-slot]') ||
          rawSelector.startsWith(':root') ||
          rawSelector.startsWith('.dark') ||
          rawSelector.startsWith('body.ziga-is-dragging-or-resizing') ||
          rawSelector.includes('::-webkit-scrollbar');

        if (isPreflightOrTheme) return;

        // Ensure border-width utilities also set border-color: var(--border) to defeat bootstrap.css .border
        const declProps = new Set();
        let borderWidthVal = null;
        rule.each((node) => {
          if (node.type === 'decl') {
            declProps.add(node.prop);
            if (node.prop.endsWith('width') && node.prop.startsWith('border')) {
              borderWidthVal = node.value;
            }
          }
        });

        if (borderWidthVal && borderWidthVal !== '0' && borderWidthVal !== '0px') {
          if (declProps.has('border-width') && !declProps.has('border-color')) {
            rule.append({ prop: 'border-style', value: 'solid', important: true });
            rule.append({ prop: 'border-color', value: 'var(--border)', important: true });
          }
          if (declProps.has('border-top-width') && !declProps.has('border-top-color')) {
            rule.append({ prop: 'border-top-style', value: 'solid', important: true });
            rule.append({ prop: 'border-top-color', value: 'var(--border)', important: true });
          }
          if (declProps.has('border-bottom-width') && !declProps.has('border-bottom-color')) {
            rule.append({ prop: 'border-bottom-style', value: 'solid', important: true });
            rule.append({ prop: 'border-bottom-color', value: 'var(--border)', important: true });
          }
          if (declProps.has('border-left-width') && !declProps.has('border-left-color')) {
            rule.append({ prop: 'border-left-style', value: 'solid', important: true });
            rule.append({ prop: 'border-left-color', value: 'var(--border)', important: true });
          }
          if (declProps.has('border-right-width') && !declProps.has('border-right-color')) {
            rule.append({ prop: 'border-right-style', value: 'solid', important: true });
            rule.append({ prop: 'border-right-color', value: 'var(--border)', important: true });
          }
          if (declProps.has('border-inline-width') && !declProps.has('border-inline-color')) {
            rule.append({ prop: 'border-inline-style', value: 'solid', important: true });
            rule.append({ prop: 'border-inline-color', value: 'var(--border)', important: true });
          }
          if (declProps.has('border-block-width') && !declProps.has('border-block-color')) {
            rule.append({ prop: 'border-block-style', value: 'solid', important: true });
            rule.append({ prop: 'border-block-color', value: 'var(--border)', important: true });
          }
        }

        // Scope top-level selectors
        if (!inNestedRule && rule.selectors) {
          rule.selectors = rule.selectors.map(scopeSingleSelector);
        }

        // Add !important to visual declarations so they beat bootstrap.css !important rules,
        // while keeping inline-controlled layout properties (display, width/height, position/offsets)
        // free for React inline style={{ ... }} and Base UI positioning/progress/resize.
        const NON_IMPORTANT_LAYOUT_PROPS = new Set([
          'position',
          'top',
          'right',
          'bottom',
          'left',
          'inset',
          'inset-inline',
          'inset-block',
          'inset-inline-start',
          'inset-inline-end',
          'inset-block-start',
          'inset-block-end',
          'width',
          'height',
          'min-width',
          'max-width',
          'min-height',
          'max-height',
          'transform'
        ]);
        const isMinimizedAutoSize = rawSelector.includes('minimized');
        const hasNestedSupports = rule.some(
          (node) => node.type === 'atrule' && node.name === 'supports'
        );

        rule.walkDecls((decl) => {
          if (decl.prop.startsWith('--')) return;
          if (decl.prop === 'display' && decl.value !== 'none') return;
          if (NON_IMPORTANT_LAYOUT_PROPS.has(decl.prop) && !isMinimizedAutoSize) return;
          // Never make fallbacks in rules with nested @supports !important,
          // otherwise browsers that struggle with nested @supports will lock to the solid fallback!
          if (hasNestedSupports && decl.parent === rule) return;
          decl.important = true;
        });
      });
    }
  };
}
isolateFromBootstrapPlugin.postcss = true;

/**
 * Final pass: Tailwind v4 emits opacity utilities (e.g. `.bg-primary/10`) as
 *   background-color: var(--primary);               <- fallback
 *   @supports (color: color-mix(...)) { background-color: color-mix(...); }
 *
 * In older Chromium / WebViews, nested `@supports` inside style rules is invalid syntax,
 * causing the browser to drop the `@supports` and force the solid fallback.
 *
 * Fix:
 * 1. Remove the solid fallback declaration inside the rule.
 * 2. Unnest / hoist the `@supports` at-rule to the parent level with standard CSS syntax.
 * 3. Mark the hoisted `color-mix` declarations as !important.
 */
function unnestAndFixSupportsPlugin() {
  return {
    postcssPlugin: 'unnest-and-fix-supports',
    OnceExit(root) {
      root.walkRules((rule) => {
        const nestedSupports = [];
        rule.each((node) => {
          if (node.type === 'atrule' && node.name === 'supports') {
            nestedSupports.push(node);
          }
        });

        if (nestedSupports.length > 0) {
          // Remove solid fallbacks (e.g. background-color: var(--primary)) inside this rule
          rule.each((node) => {
            if (
              node.type === 'decl' &&
              (node.prop === 'background-color' ||
                node.prop === 'color' ||
                node.prop.startsWith('border'))
            ) {
              node.remove();
            }
          });

          // Hoist the @supports at-rules to the parent container
          nestedSupports.forEach((atRule) => {
            const clonedRule = rule.clone({ nodes: [] });
            atRule.each((child) => clonedRule.append(child.clone()));
            atRule.removeAll();
            atRule.append(clonedRule);
            rule.parent.insertAfter(rule, atRule);
          });
        }
      });

      root.walkAtRules('supports', (atRule) => {
        atRule.walkDecls((decl) => {
          if (decl.prop.startsWith('--')) return;
          decl.important = true;
        });
      });
    }
  };
}
unnestAndFixSupportsPlugin.postcss = true;

async function buildCss() {
  if (!fs.existsSync(srcStylesDir)) {
    fs.mkdirSync(srcStylesDir, { recursive: true });
  }

  const baseCss = fs.existsSync(baseOverlayPath)
    ? fs.readFileSync(baseOverlayPath, 'utf8')
    : '';
  const twInput = fs.readFileSync(tailwindInputPath, 'utf8');

  const result = await postcss([
    tailwindcssPostcss({
      base: rootDir
    }),
    isolateFromBootstrapPlugin(),
    autoprefixer,
    unnestAndFixSupportsPlugin()
  ]).process(twInput, {
    from: tailwindInputPath,
    to: outStylesCss
  });

  const combinedCss = `${baseCss}\n\n/* ===== Compiled Tailwind CSS v4 & Official shadcn/ui (base-nova) ===== */\n${result.css}\n`;
  fs.writeFileSync(outStylesCss, combinedCss, 'utf8');
  fs.writeFileSync(outRootCss, combinedCss, 'utf8');
  console.log(
    `[Build CSS] Compiled base_overlay.css + Scoped Tailwind v4 + shadcn/ui (base-nova) into styles/overlay.css & overlay.css (${Buffer.byteLength(combinedCss)} bytes)`
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
  const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

  try {
    await buildCss();
    await buildJs();
  } catch (err) {
    console.error('[Build Error]', err);
    if (!isWatch) process.exit(1);
  }

  if (isWatch) {
    console.log('\n[Watch Mode] 🚀 Dang theo doi thay doi trong thu muc src/... (Ctrl+C de dung)');
    const srcDir = path.join(rootDir, 'src');
    let isBuilding = false;
    let pendingRebuild = false;

    const triggerRebuild = async () => {
      if (isBuilding) {
        pendingRebuild = true;
        return;
      }
      isBuilding = true;
      const startTime = Date.now();
      try {
        console.log('\n[Watch] Phat hien file thay doi, dang tu dong build lai...');
        await buildCss();
        await buildJs();
        console.log(`[Watch] ✨ Da cap nhat injected.js & overlay.css thanh cong (${Date.now() - startTime}ms)!`);
      } catch (err) {
        console.error('[Watch Build Error]', err);
      } finally {
        isBuilding = false;
        if (pendingRebuild) {
          pendingRebuild = false;
          triggerRebuild();
        }
      }
    };

    let debounceTimer = null;
    fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      if (filename.includes('node_modules') || filename.startsWith('.')) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(triggerRebuild, 150);
    });
  }
}

main();
