# WBS Manager 仕様書

AI（Claude Code / Google Antigravity）での実装・改修を効率化するため、仕様を目的別に分割しています。

## ファイル一覧

| ファイル | 内容 | いつ読むか |
|---------|------|----------|
| [00-overview.md](./00-overview.md) | 背景・目的・制約条件 | プロジェクト理解時 |
| [01-architecture.md](./01-architecture.md) | システム構成・フォルダ構成・技術スタック | 新機能追加・構造変更時 |
| [02-data-schema.md](./02-data-schema.md) | JSONデータ構造・フィールド定義 | データ操作・API実装時 |
| [03-features.md](./03-features.md) | 機能一覧・実装状態・未実装タスク | 機能追加・バグ修正時 |
| [04-ui-spec.md](./04-ui-spec.md) | 画面構成・色設計・コンポーネント | UI変更・スタイル修正時 |
| [05-logic.md](./05-logic.md) | 進捗計算・ステータス判定ロジック | 計算ロジック変更時 |
| [06-code-structure.md](./06-code-structure.md) | ソースコード構造・関数リファレンス | コード修正・関数追加時 |

## クイックリファレンス

### 技術スタック
- **フロントエンド**: HTML + CSS + Vanilla JavaScript (ES Modules)
- **データ保存**: File System Access API + JSON ファイル
- **ブラウザ**: Chrome / Edge (Chromium系)
- **ビルド**: Node.js (`node build.js` で単一HTMLに統合)

### 主要ファイル
```
wbs-manager.html    # 配布用（ビルド成果物）
src/
├── main.js         # エントリーポイント
├── js/
│   ├── state.js    # グローバル状態管理
│   ├── storage.js  # ファイルI/O
│   └── ui/         # UI描画
└── styles/         # CSS
```

### データ保存先
```
共有フォルダ/
└── {projectId}/
    ├── project.json      # プロジェクト情報
    ├── categories.json   # カテゴリマスタ
    ├── members.json      # メンバーマスタ
    ├── milestones.json   # マイルストーン
    └── wbs/
        └── wbs_xxx.json  # WBSノード（1ファイル1ノード）
```

## 改修時の推奨フロー

1. **背景理解が必要** → `00-overview.md`
2. **データ構造を確認** → `02-data-schema.md`
3. **実装済み/未実装を確認** → `03-features.md`
4. **該当コードを特定** → `06-code-structure.md`
5. **UIを変更** → `04-ui-spec.md`
6. **ロジックを変更** → `05-logic.md`
