# アーキテクチャ

## 技術スタック

| 項目 | 技術 |
|------|------|
| フロントエンド | HTML + CSS + JavaScript (ES Modules, ライブラリ不使用) |
| データ形式 | JSON |
| ファイルアクセス | File System Access API |
| 対応ブラウザ | Chrome / Edge (Chromium系) |
| ビルドツール | Node.js (build.js) |

## ソースコード構成

```
project-management/
├── wbs-manager.html        # [成果物] 配布用単一HTML（ビルド生成）
├── build.js                # ビルドスクリプト
├── src/
│   ├── index.html          # HTMLテンプレート
│   ├── main.js             # エントリーポイント、イベントハンドラ
│   ├── js/
│   │   ├── state.js        # グローバル状態管理
│   │   ├── storage.js      # ファイルI/O（読み書き）
│   │   ├── ui/
│   │   │   ├── tree.js     # WBSツリー描画
│   │   │   ├── gantt.js    # ガントチャート描画
│   │   │   └── modals.js   # モーダルダイアログ
│   │   └── utils/
│   │       ├── dom.js      # DOM操作ユーティリティ
│   │       └── date.js     # 日付フォーマット
│   └── styles/
│       ├── main.css        # スタイル統合（@import）
│       ├── variables.css   # CSS変数（色・サイズ）
│       ├── base.css        # ベーススタイル
│       ├── layout.css      # レイアウト
│       └── components/     # コンポーネント別CSS
├── specs/                  # 仕様書
├── ROADMAP.md              # 開発ロードマップ
└── README.md               # 開発ガイド
```

## データ保存先（共有フォルダ）

```
共有フォルダ/                           # File System Access APIで選択
└── {projectId}/                       # プロジェクトフォルダ
    ├── project.json                   # プロジェクト情報
    ├── categories.json                # カテゴリマスタ
    ├── members.json                   # メンバーマスタ
    ├── milestones.json                # マイルストーン一覧
    └── wbs/
        ├── wbs_1705123456789.json     # WBSノード（1ファイル1ノード）
        └── ...
```

## ビルドプロセス

```bash
node build.js
```

1. `src/index.html` をベースに
2. `<link rel="stylesheet">` → インラインCSS（`<style>`タグ）に置換
3. `<script type="module" src="...">` → インラインJS（`<script>`タグ）に置換
4. ES Module の import/export を除去し、グローバルスコープで連結
5. `wbs-manager.html` として出力

**開発時**: `src/` 配下を編集
**配布時**: `wbs-manager.html` のみを配布

## 設計原則

### 1ノード1ファイル方式
- 各WBSは独立したJSONファイル（`wbs_{timestamp}.json`）
- 同じWBSを同時編集しない限り競合しない
- ファイル名にID（タイムスタンプ）を使用

### 即時保存
- 保存ボタン不要
- 操作（追加・編集・削除）ごとに即座にファイル書き込み

### 自動リロード
- 60秒間隔でデータを再読み込み
- 他メンバーの変更を反映

### グローバル状態管理
- `state.js` で単一のstateオブジェクトを管理
- 各モジュールがimportして参照・更新

```javascript
// src/js/state.js
export const state = {
    directoryHandle: null,    // File System Access API ハンドル
    currentProject: null,     // 選択中のプロジェクト
    projects: [],             // プロジェクト一覧
    wbsItems: [],             // WBSノード一覧
    categories: [],           // カテゴリマスタ
    members: [],              // メンバーマスタ
    milestones: [],           // マイルストーン一覧
    expandedNodes: new Set(), // 展開中のノードコード
    editingWbsId: null,       // 編集中のWBS ID
    currentView: 'tree',      // 現在のビュー（tree/gantt）
    autoReloadInterval: null  // 自動リロードのインターバルID
};
```

## モジュール依存関係

```
main.js
├── state.js
├── storage.js ──── state.js, utils/dom.js
├── ui/tree.js ──── state.js, utils/dom.js, utils/date.js
├── ui/gantt.js ─── state.js, utils/dom.js
├── ui/modals.js ── state.js, storage.js, utils/dom.js
└── utils/dom.js
```
