# UI仕様

## 画面構成

```
┌─────────────────────────────────────────────────────────────────────┐
│ [ロゴ] WBS Manager  [プロジェクト▼][+新規]  [管理ボタン群] [ユーザー]│
├────────────┬────────────────────────────────────────────────────────┤
│            │ [+ WBS追加] [+ 運用枠追加]        [全展開] [全折畳]    │
│  サマリー   ├────────────────────────────────────────────────────────┤
│  ┌──┬──┐  │ WBS名          │担当│状態  │期間      │進捗│依存│操作│
│  │45%│12│  │ ▼ 1. 設計      │    │      │          │    │    │    │
│  │進捗│項目│  │   1.1 要件定義 │山田│進行中│2/1-2/7  │60% │    │    │
│  └──┴──┘  │   1.2 基本設計 │佐藤│未着手│2/8-2/21 │30% │→1.1│    │
│  ┌──┬──┐  │ ▼ 2. 開発      │    │      │          │    │    │    │
│  │ 2│ 8│  │                │    │      │          │    │    │    │
│  │遅延│完了│  │────────────────────────────────────────────────────────│
│  └──┴──┘  │ ガントチャート（ganttViewで切り替え）                  │
│            │   ████████░░░░░░ 1.1 要件定義                          │
│ [ツリー]   │        ████░░░░░░░░ 1.2 基本設計                       │
│ [ガント]   │                                                        │
├────────────┴────────────────────────────────────────────────────────┤
│ 凡例: ■成果物 ■運用 ■バッファ ◆MS                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## エリア構成

| エリア | 要素ID | 説明 |
|--------|--------|------|
| ヘッダー | `.header` | ロゴ、プロジェクト選択、管理ボタン、ユーザー名 |
| サイドバー | `.sidebar` | サマリー、ビュー切り替え、凡例 |
| メインコンテンツ | `.content` | ツールバー、WBSツリー/ガントチャート |
| セットアップ画面 | `#setupScreen` | 初期設定（フォルダ選択前） |

## ヘッダー管理ボタン

```html
<button onclick="window.app.showCategoryModal()">カテゴリ管理</button>
<button onclick="window.app.showMemberModal()">メンバー管理</button>
<button onclick="window.app.showMilestoneModal()">マイルストーン管理</button>
```

---

## カラーパレット

### 基本色（CSS変数: `styles/variables.css`）

| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--bg-primary` | `#0f1419` | アプリ全体の背景 |
| `--bg-secondary` | `#1a2332` | サイドバー、ヘッダー |
| `--bg-tertiary` | `#243044` | フォーム、ボタン背景 |
| `--text-primary` | `#e7edf4` | 本文 |
| `--text-secondary` | `#8899a6` | ラベル、補足 |
| `--border-color` | `#38444d` | ボーダー |

### アクセントカラー

| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--accent-blue` | `#1d9bf0` | 成果物、プライマリボタン、順調 |
| `--accent-green` | `#00ba7c` | 完了、進捗バー |
| `--accent-orange` | `#ff7a00` | 運用・サポート、保留 |
| `--accent-purple` | `#7856ff` | バッファ |
| `--accent-yellow` | `#ffd400` | マイルストーン、注意 |
| `--accent-red` | `#f4212e` | 遅延、エラー、削除 |

---

## WBS種別の色分け

| 種別 | CSSクラス | 色 |
|------|----------|-----|
| 成果物 | `.deliverable` | `--accent-blue` |
| 運用・サポート | `.support` | `--accent-orange` |
| バッファ | `.buffer` | `--accent-purple` |

```css
.wbs-type-badge.deliverable { background: var(--accent-blue); }
.wbs-type-badge.support { background: var(--accent-orange); }
.wbs-type-badge.buffer { background: var(--accent-purple); }
```

---

## ステータス表示

### 現在の実装（4段階）

| ステータス | CSSクラス | 表示テキスト | 背景色 |
|-----------|----------|-------------|--------|
| `not-started` | `.not-started` | 未着手 | グレー半透明 |
| `in-progress` | `.in-progress` | 進行中 | 青半透明 |
| `completed` | `.completed` | 完了 | 緑半透明 |
| `on-hold` | `.on-hold` | 保留 | 橙半透明 |

### Phase 1.5 拡張予定（6段階）

| ステータス | 表示 | 色 |
|-----------|------|-----|
| `not-started` | 未着手 | グレー |
| `on-track` | 順調 | 青 |
| `at-risk` | 注意 | 黄 |
| `delayed` | 遅延 | 赤 |
| `on-hold` | 保留 | 橙 |
| `completed` | 完了 | 緑 |

---

## モーダルダイアログ

### 共通構造

```html
<div class="modal-overlay" id="xxxModal">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">タイトル</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <!-- フォーム内容 -->
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">キャンセル</button>
      <button class="btn btn-primary">保存</button>
    </div>
  </div>
</div>
```

### モーダル一覧

| ID | 用途 | 表示関数 | 閉じる関数 |
|----|------|---------|-----------|
| `#wbsModal` | WBS追加・編集 | `showAddWbsModal()`, `showEditWbsModal()` | `closeWbsModal()` |
| `#projectModal` | プロジェクト作成 | `showNewProjectModal()` | `closeProjectModal()` |
| `#categoryModal` | カテゴリ管理 | `showCategoryModal()` | `closeCategoryModal()` |
| `#memberModal` | メンバー管理 | `showMemberModal()` | `closeMemberModal()` |
| `#milestoneModal` | マイルストーン管理 | `showMilestoneModal()` | `closeMilestoneModal()` |

---

## コンテキストメニュー

```html
<div class="context-menu" id="contextMenu">
  <div class="context-menu-item" onclick="contextMenuAction('edit')">✏️ 編集</div>
  <div class="context-menu-item" onclick="contextMenuAction('addChild')">➕ 子WBS追加</div>
  <div class="context-menu-item" onclick="contextMenuAction('duplicate')">📋 複製</div>
  <div class="context-menu-divider"></div>
  <div class="context-menu-item danger" onclick="contextMenuAction('delete')">🗑️ 削除</div>
</div>
```

- WBSアイテムを右クリックで表示
- 位置: クリック座標に配置
- 閉じる: 画面クリックで非表示

---

## トースト通知

```javascript
showToast('メッセージ', 'success'); // 成功（緑）
showToast('メッセージ', 'error');   // エラー（赤）
showToast('メッセージ', 'info');    // 情報（青）
```

- 画面右上に表示
- 3秒後に自動で消える
- スライドインアニメーション

---

## レスポンシブ対応

現在は未対応（デスクトップ前提）。
最小幅: 1024px を想定。
