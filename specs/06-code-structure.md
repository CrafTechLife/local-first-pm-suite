# コード構造

## ファイル一覧

```
src/
├── index.html              # HTMLテンプレート
├── main.js                 # エントリーポイント
├── js/
│   ├── state.js            # グローバル状態管理
│   ├── storage.js          # ファイルI/O
│   ├── ui/
│   │   ├── tree.js         # WBSツリー描画
│   │   ├── gantt.js        # ガントチャート描画
│   │   └── modals.js       # モーダルダイアログ
│   └── utils/
│       ├── dom.js          # DOM操作ユーティリティ
│       └── date.js         # 日付フォーマット
└── styles/
    ├── main.css            # スタイル統合
    ├── variables.css       # CSS変数
    ├── base.css            # ベーススタイル
    ├── layout.css          # レイアウト
    └── components/
        ├── buttons.css
        ├── gantt.css
        ├── modals.css
        ├── tree.css
        └── widgets.css
```

---

## src/js/state.js

**役割**: グローバル状態を一元管理

```javascript
export const state = {
    directoryHandle: null,    // File System Access API ハンドル
    currentProject: null,     // 選択中のプロジェクト（project.jsonの内容）
    projects: [],             // プロジェクト一覧
    wbsItems: [],             // WBSノード一覧（ソート済み）
    categories: [],           // カテゴリマスタ
    members: [],              // メンバーマスタ
    milestones: [],           // マイルストーン一覧
    expandedNodes: new Set(), // 展開中のノードコード
    editingWbsId: null,       // 編集中のWBS ID
    contextMenuTarget: null,  // 右クリック対象のWBS ID
    currentView: 'tree',      // 現在のビュー（'tree' | 'gantt'）
    autoReloadInterval: null  // 自動リロードのインターバルID
};

export function updateState(newState) {
    Object.assign(state, newState);
}
```

---

## src/js/storage.js

**役割**: File System Access API を使用したファイル読み書き

### エクスポート関数

| 関数名 | 説明 |
|--------|------|
| `selectProjectFolder()` | フォルダ選択ダイアログを開く |
| `loadProjects()` | プロジェクト一覧を読み込み |
| `loadMasterData()` | カテゴリ・メンバー・マイルストーンを読み込み |
| `loadWbsItems()` | WBSノードを読み込み（ソート済み） |
| `saveWbs(wbs)` | WBSノードを保存 |
| `deleteWbs(wbsId)` | WBSノードを削除 |
| `createProject(project)` | 新規プロジェクトを作成 |
| `saveCategories(categories)` | カテゴリを保存 |
| `saveMembers(members)` | メンバーを保存 |
| `saveMilestones(milestones)` | マイルストーンを保存 |
| `compareWbsCode(a, b)` | WBSコードのソート比較関数 |

### 使用例

```javascript
import { loadWbsItems, saveWbs } from './storage.js';

// 読み込み
await loadWbsItems();  // state.wbsItems が更新される

// 保存
await saveWbs({
    id: 'wbs_' + Date.now(),
    code: '1.1',
    name: '要件定義',
    // ...
});
```

---

## src/js/ui/tree.js

**役割**: WBSツリーの描画

### エクスポート関数

| 関数名 | 説明 |
|--------|------|
| `renderWbsTree()` | WBSツリーを再描画 |

### 内部関数

| 関数名 | 説明 |
|--------|------|
| `buildTree()` | フラットな配列から階層構造を構築 |
| `renderTreeNodes(nodes, level)` | 再帰的にHTML生成 |
| `getStatusLabel(status)` | ステータスの表示文字列を取得 |

---

## src/js/ui/gantt.js

**役割**: ガントチャートの描画

### エクスポート関数

| 関数名 | 説明 |
|--------|------|
| `renderGanttChart()` | ガントチャートを再描画 |

### 定数

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `dayWidth` | 40 | 1日の幅（px） |

---

## src/js/ui/modals.js

**役割**: 各種モーダルダイアログの表示・操作

### エクスポート関数

| 関数名 | 説明 |
|--------|------|
| `showNewProjectModal()` | プロジェクト作成モーダルを表示 |
| `closeProjectModal()` | プロジェクト作成モーダルを閉じる |
| `showAddWbsModal(parentCode?, defaultType?)` | WBS追加モーダルを表示 |
| `showEditWbsModal(wbsId)` | WBS編集モーダルを表示 |
| `closeWbsModal()` | WBSモーダルを閉じる |
| `showCategoryModal()` | カテゴリ管理モーダルを表示 |
| `closeCategoryModal()` | カテゴリ管理モーダルを閉じる |
| `saveCategory()` | カテゴリを追加 |
| `deleteCategory(id)` | カテゴリを削除 |
| `showMemberModal()` | メンバー管理モーダルを表示 |
| `closeMemberModal()` | メンバー管理モーダルを閉じる |
| `saveMember()` | メンバーを追加 |
| `deleteMember(id)` | メンバーを削除 |
| `showMilestoneModal()` | マイルストーン管理モーダルを表示 |
| `closeMilestoneModal()` | マイルストーン管理モーダルを閉じる |
| `saveMilestone()` | マイルストーンを追加 |
| `deleteMilestone(id)` | マイルストーンを削除 |

---

## src/js/utils/dom.js

**役割**: DOM操作のユーティリティ

### エクスポート関数

| 関数名 | 説明 |
|--------|------|
| `escapeHtml(str)` | XSS対策のHTMLエスケープ |
| `showToast(message, type)` | トースト通知を表示 |

---

## src/js/utils/date.js

**役割**: 日付フォーマット

### エクスポート関数

| 関数名 | 説明 |
|--------|------|
| `formatDateRange(start, end)` | 日付範囲を「M/D - M/D」形式で表示 |

---

## src/main.js

**役割**: エントリーポイント、イベントハンドラ、グローバル関数

### window.app にエクスポートされる関数

HTMLからの呼び出し用にグローバル公開：

| 関数名 | 説明 |
|--------|------|
| `selectProjectFolder()` | フォルダ選択 |
| `switchProject()` | プロジェクト切り替え |
| `showNewProjectModal()` | プロジェクト作成モーダル表示 |
| `closeProjectModal()` | プロジェクト作成モーダル閉じる |
| `createProject()` | プロジェクト作成実行 |
| `reloadData()` | データ再読み込み |
| `saveUserName()` | ユーザー名保存 |
| `switchView(view)` | ビュー切り替え（'tree' | 'gantt'） |
| `expandAll()` | 全展開 |
| `collapseAll()` | 全折畳 |
| `showAddWbsModal()` | WBS追加モーダル表示 |
| `showEditWbsModal(wbsId)` | WBS編集モーダル表示 |
| `closeWbsModal()` | WBSモーダル閉じる |
| `saveWbs()` | WBS保存実行 |
| `deleteWbs(wbsId)` | WBS削除実行 |
| `toggleNode(code)` | ノード展開/折畳 |
| `showContextMenu(event, wbsId)` | コンテキストメニュー表示 |
| `contextMenuAction(action)` | コンテキストメニューアクション実行 |
| `getNextTopCode()` | 次の最上位コードを取得 |
| `getNextChildCode(parentCode)` | 次の子コードを取得 |
| `updateParentSelect(selectedCode?)` | 親WBS選択を更新 |
| `updateDependenciesSelect(selectedDeps?)` | 依存関係選択を更新 |
| `updateCategorySelect(selectedCategoryId?)` | カテゴリ選択を更新 |
| `updateMemberSelect(selectedAssignee?)` | 担当者選択を更新 |
| `showCategoryModal()` | カテゴリ管理モーダル表示 |
| `closeCategoryModal()` | カテゴリ管理モーダル閉じる |
| `saveCategory()` | カテゴリ保存 |
| `deleteCategory(id)` | カテゴリ削除 |
| `showMemberModal()` | メンバー管理モーダル表示 |
| `closeMemberModal()` | メンバー管理モーダル閉じる |
| `saveMember()` | メンバー保存 |
| `deleteMember(id)` | メンバー削除 |
| `showMilestoneModal()` | マイルストーン管理モーダル表示 |
| `closeMilestoneModal()` | マイルストーン管理モーダル閉じる |
| `saveMilestone()` | マイルストーン保存 |
| `deleteMilestone(id)` | マイルストーン削除 |

### 内部関数

| 関数名 | 説明 |
|--------|------|
| `loadProjectsList()` | プロジェクト一覧をロードしてセレクトボックスを更新 |
| `handleCreateProject()` | プロジェクト作成のハンドラ |
| `handleSaveWbs()` | WBS保存のハンドラ |
| `handleDeleteWbs(wbsId)` | WBS削除のハンドラ |
| `updateSummary()` | サマリー表示を更新 |
| `updateConnectionStatus(connected)` | 接続ステータス表示を更新 |
| `startAutoReload()` | 60秒自動リロードを開始 |
| `duplicateWbs(wbsId)` | WBS複製 |
| `isDescendant(childCode, parentCode)` | 子孫判定 |

---

## 新機能追加のガイドライン

### 新しいモーダルを追加する場合

1. `src/index.html` にモーダルHTMLを追加
2. `src/js/ui/modals.js` に `show*Modal()`, `close*Modal()`, `save*()` 関数を追加
3. `src/main.js` の `window.app` にエクスポート
4. 必要に応じて `src/js/storage.js` にファイルI/O関数を追加

### 新しいビューを追加する場合

1. `src/index.html` に表示エリアを追加（`#xxxView`）
2. `src/js/ui/xxx.js` を新規作成
3. `src/main.js` に `switchView()` の分岐を追加
4. サイドバーにビュー切り替えタブを追加

### 新しいデータを保存する場合

1. `src/js/state.js` に state プロパティを追加
2. `src/js/storage.js` に `loadXxx()`, `saveXxx()` 関数を追加
3. `loadMasterData()` で読み込むように追加
