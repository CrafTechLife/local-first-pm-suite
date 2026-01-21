# 機能一覧

## フェーズ概要

| フェーズ | 状態 | 内容 |
|---------|------|------|
| Phase 1 | 実装済み | WBS管理基盤（MVP） |
| Phase 1.5 | 一部実装済み | マスタ管理・機能拡張 |
| Phase 2 | 未実装 | タスク連携 |
| Phase 3 | 未実装 | 可視化強化 |

---

## Phase 1: WBS管理基盤（実装済み）

### WBSツリー表示・編集
| 機能 | 実装ファイル |
|------|-------------|
| 階層構造をインデント表示 | `ui/tree.js` |
| 展開/折畳み（個別・全展開・全折畳み） | `main.js` (`toggleNode`, `expandAll`, `collapseAll`) |
| WBS追加・編集・削除 | `main.js`, `storage.js` |
| WBSコード自動採番 | `main.js` (`getNextTopCode`, `getNextChildCode`) |
| 種別（成果物/運用/バッファ）の色分け | CSS class (`deliverable`, `support`, `buffer`) |
| マイルストーン表示（◆アイコン） | `ui/tree.js` |
| 右クリックコンテキストメニュー | `main.js` (`showContextMenu`, `contextMenuAction`) |

### 依存関係
| 機能 | 実装ファイル |
|------|-------------|
| 先行WBSの設定（複数選択可） | `ui/modals.js` |
| 依存関係の一覧表示（→コード形式） | `ui/tree.js` |

### 進捗管理
| 機能 | 実装ファイル |
|------|-------------|
| 手動での進捗率入力（0-100%） | `ui/modals.js` |
| ステータス管理（4段階） | `main.js` (`handleSaveWbs`で自動設定) |

### ガントチャート
| 機能 | 実装ファイル |
|------|-------------|
| 日付ベースの横棒表示 | `ui/gantt.js` |
| 種別ごとの色分け | `ui/gantt.js` |
| 進捗率のオーバーレイ表示 | `ui/gantt.js` |
| マイルストーンの菱形表示 | `ui/gantt.js` |
| 今日の日付ハイライト | `ui/gantt.js` |
| 週末の背景色変更 | `ui/gantt.js` |

### サマリー表示
| 機能 | 実装ファイル |
|------|-------------|
| 全体進捗率（工数加重平均） | `main.js` (`updateSummary`) |
| WBS項目数 | `main.js` (`updateSummary`) |
| 遅延項目数 | `main.js` (`updateSummary`) |
| 完了項目数 | `main.js` (`updateSummary`) |

### プロジェクト管理
| 機能 | 実装ファイル |
|------|-------------|
| 複数プロジェクト対応 | `storage.js` (`loadProjects`) |
| プロジェクト切り替え | `main.js` (`switchProject`) |
| 新規プロジェクト作成 | `main.js`, `storage.js` |

### 共通機能
| 機能 | 実装ファイル |
|------|-------------|
| ユーザー名設定（localStorage保存） | `main.js` (`saveUserName`) |
| 作成者・更新者の記録 | `main.js` (`handleSaveWbs`) |
| 60秒ごとの自動リロード | `main.js` (`startAutoReload`) |
| 手動リロードボタン | `main.js` (`reloadData`) |
| 接続ステータス表示 | `main.js` (`updateConnectionStatus`) |
| トースト通知 | `utils/dom.js` (`showToast`) |

---

## Phase 1.5: マスタ管理・機能拡張

### 実装済み

| 機能 | 実装ファイル |
|------|-------------|
| カテゴリ管理ダイアログ | `ui/modals.js` |
| カテゴリ追加（名前+色） | `ui/modals.js` (`saveCategory`) |
| カテゴリ削除 | `ui/modals.js` (`deleteCategory`) |
| カテゴリ一覧表示 | `ui/modals.js` (`renderCategoryList`) |
| メンバー管理ダイアログ | `ui/modals.js` |
| メンバー追加（名前+役割） | `ui/modals.js` (`saveMember`) |
| メンバー削除 | `ui/modals.js` (`deleteMember`) |
| 担当者選択のドロップダウン化 | `main.js` (`updateMemberSelect`) |
| マイルストーン管理ダイアログ | `ui/modals.js` |
| マイルストーン追加 | `ui/modals.js` (`saveMilestone`) |
| マイルストーン削除 | `ui/modals.js` (`deleteMilestone`) |
| ガントチャート上のマイルストーン表示 | `ui/gantt.js` |

### 未実装

#### ステータス拡張（6段階）
現在は4段階（not-started, in-progress, completed, on-hold）

**実装タスク**:
1. `ui/tree.js`: `getStatusLabel()` に新ステータス追加
2. `main.js`: `handleSaveWbs()` のステータス自動設定ロジック更新
3. `styles/`: ステータス別の色定義追加
4. 移行処理: `in-progress` → `on-track` の自動変換

#### ガントチャート機能拡張
| 機能 | 実装方針 |
|------|---------|
| 時間スケール切替（日/週/月） | `ui/gantt.js` に `dayWidth` を動的に変更するロジック追加 |
| 水平ズーム（スライダー） | ツールバーにrange inputを追加 |
| 垂直ズーム（スライダー） | 行高さをCSS変数で制御 |
| 「今日へ移動」ボタン | スクロール位置を計算して移動 |
| 「全体表示」ボタン | 全期間が見えるようdayWidthを自動計算 |

#### フィルタリング機能
| 機能 | 実装方針 |
|------|---------|
| 担当者別 | `state.wbsItems` をフィルタしてから `renderWbsTree()` |
| カテゴリ別 | 同上 |
| ステータス別 | 同上 |

#### その他
| 機能 | 実装方針 |
|------|---------|
| カテゴリ編集 | `renderCategoryList` に編集ボタン追加 |
| メンバー編集 | `renderMemberList` に編集ボタン追加 |
| WBS項目へのカテゴリ紐付け表示 | ツリー・ガントに色バッジ表示 |
| 設定メニューUI | ヘッダーにドロップダウンメニュー追加 |

---

## Phase 2: タスク連携（未実装）

**目的**: 既存のタスク管理ツールとの連携

| 機能 | 説明 |
|------|------|
| タスクのWBS紐付け | タスクJSONに `projectId`, `wbsCode` フィールド追加 |
| WBSからタスク一覧表示 | WBS詳細に紐づくタスクを表示 |
| 進捗自動計算 | `progressCalcMethod: taskBased` の実装 |
| タスク作成ショートカット | WBSからタスクを直接作成 |

---

## Phase 3: 可視化強化（未実装）

| 機能 | 説明 |
|------|------|
| 依存関係線 | ガントチャート上に矢印で依存関係を表示 |
| クリティカルパス | 遅延リスクのある経路をハイライト |
| ドラッグ＆ドロップ編集 | ガントチャート上でバーを移動 |
| ダッシュボード強化 | 担当者別進捗、フェーズ別進捗 |
| レポート出力 | 週次進捗サマリーのHTML出力 |
| EVM指標 | PV/EV/ACの計算・グラフ表示 |
| ベースライン管理 | 計画変更の履歴保持・比較 |
