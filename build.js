import fs from 'fs';
import path from 'path';

const SRC_DIR = 'src';
const OUTPUT_FILE = 'wbs-manager.html';

async function build() {
    console.log('Building single HTML file...');

    let html = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');

    // スタイルの統合
    const cssFiles = [
        'variables.css',
        'base.css',
        'layout.css',
        'components/buttons.css',
        'components/modals.css',
        'components/tree.css',
        'components/gantt.css',
        'components/widgets.css'
    ];

    let combinedCss = '';
    for (const file of cssFiles) {
        combinedCss += fs.readFileSync(path.join(SRC_DIR, 'styles', file), 'utf8') + '\n';
    }

    // スクリプトの統合（簡易的なモジュール結合）
    // 依存関係順に結合する必要がある
    const jsFiles = [
        'js/state.js',
        'js/utils/dom.js',
        'js/utils/date.js',
        'js/storage.js',
        'js/ui/tree.js',
        'js/ui/gantt.js',
        'js/ui/modals.js',
        'main.js'
    ];

    let combinedJs = '';
    for (const file of jsFiles) {
        let content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
        // ESMキーワードの除去（ブラウザでの直接動作のため）
        content = content.replace(/export\s+const\s+/g, 'const ')
            .replace(/export\s+function\s+/g, 'function ')
            .replace(/export\s+module\s+/g, 'module ') // Just in case
            .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
        combinedJs += `\n/* --- ${file} --- */\n` + content + '\n';
    }

    // HTMLへの埋め込み
    html = html.replace('<link rel="stylesheet" href="/src/styles/main.css">', `<style>\n${combinedCss}\n</style>`);
    html = html.replace('<script type="module" src="/src/main.js"></script>', `<script>\n${combinedJs}\n</script>`);

    fs.writeFileSync(OUTPUT_FILE, html);
    console.log(`Build complete: ${OUTPUT_FILE}`);
}

build().catch(console.error);
