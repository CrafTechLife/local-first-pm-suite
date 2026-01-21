# データスキーマ

## ファイル一覧

| ファイル | 説明 | 形式 |
|---------|------|------|
| `project.json` | プロジェクト基本情報 | 単一オブジェクト |
| `categories.json` | カテゴリマスタ | 配列 |
| `members.json` | メンバーマスタ | 配列 |
| `milestones.json` | マイルストーン一覧 | 配列 |
| `wbs/wbs_xxx.json` | WBSノード | 単一オブジェクト（1ファイル1ノード） |

---

## project.json

```json
{
  "id": "project_ABC",
  "name": "新規システム開発",
  "description": "顧客向け新規システムの開発プロジェクト",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "createdBy": "山田太郎"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | プロジェクトID（フォルダ名と一致） |
| name | string | Yes | プロジェクト名 |
| description | string | No | 概要説明 |
| createdAt | ISO8601 | Yes | 作成日時 |
| createdBy | string | Yes | 作成者名 |

---

## categories.json

```json
[
  { "id": "cat_1705000001", "name": "設計", "color": "#1d9bf0" },
  { "id": "cat_1705000002", "name": "開発", "color": "#00ba7c" },
  { "id": "cat_1705000003", "name": "テスト", "color": "#7856ff" }
]
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | カテゴリID（`cat_` + タイムスタンプ） |
| name | string | Yes | カテゴリ名 |
| color | string | Yes | HEXカラーコード |

---

## members.json

```json
[
  { "id": "mem_1705000001", "name": "山田太郎", "role": "リーダー" },
  { "id": "mem_1705000002", "name": "佐藤花子", "role": "開発" }
]
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | メンバーID（`mem_` + タイムスタンプ） |
| name | string | Yes | 氏名 |
| role | string | No | 役割 |

---

## milestones.json

```json
[
  {
    "id": "mil_1705123456789",
    "name": "要件定義完了",
    "date": "2024-02-15",
    "description": "顧客承認を得る"
  }
]
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | マイルストーンID（`mil_` + タイムスタンプ） |
| name | string | Yes | マイルストーン名 |
| date | YYYY-MM-DD | Yes | 期日 |
| description | string | No | 説明 |

---

## wbs/wbs_xxx.json (WBSノード)

```json
{
  "id": "wbs_1705123456789",
  "code": "1.1",
  "name": "要件定義",
  "type": "deliverable",
  "categoryId": "cat_1705000001",
  "parentCode": "1",
  "level": 1,
  "assignee": "山田",
  "plannedStart": "2024-02-01",
  "plannedEnd": "2024-02-07",
  "actualStart": "2024-02-03",
  "actualEnd": null,
  "plannedEffort": 5,
  "actualEffort": 3,
  "progress": 60,
  "progressCalcMethod": "manual",
  "status": "in-progress",
  "milestone": false,
  "dependencies": ["1"],
  "note": "備考メモ",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "createdBy": "山田太郎",
  "updatedAt": "2024-01-16T14:30:00.000Z",
  "updatedBy": "佐藤花子"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | 一意識別子（`wbs_` + タイムスタンプ） |
| code | string | Yes | WBSコード（例: "1.1.2"） |
| name | string | Yes | WBS名称 |
| type | enum | Yes | `deliverable` / `support` / `buffer` |
| categoryId | string | No | カテゴリID（categories.json参照） |
| parentCode | string | No | 親WBSのコード（nullなら最上位） |
| level | number | Yes | 階層レベル（0始まり） |
| assignee | string | No | 担当者名 |
| plannedStart | YYYY-MM-DD | No | 予定開始日 |
| plannedEnd | YYYY-MM-DD | No | 予定終了日 |
| actualStart | YYYY-MM-DD | No | 実績開始日 |
| actualEnd | YYYY-MM-DD | No | 実績終了日 |
| plannedEffort | number | No | 予定工数（人日） |
| actualEffort | number | No | 実績工数（人日） |
| progress | number | Yes | 進捗率（0-100） |
| progressCalcMethod | enum | Yes | `manual` / `taskBased`（将来） |
| status | enum | Yes | ステータス（下記参照） |
| milestone | boolean | Yes | マイルストーンフラグ（レガシー用） |
| dependencies | string[] | No | 先行WBSコードの配列 |
| note | string | No | メモ |
| createdAt | ISO8601 | Yes | 作成日時 |
| createdBy | string | Yes | 作成者名 |
| updatedAt | ISO8601 | Yes | 更新日時 |
| updatedBy | string | Yes | 更新者名 |

### type（WBS種別）

| 値 | 用途 | 進捗計算への影響 |
|-----|------|-----------------|
| `deliverable` | 通常の成果物・作業 | 通常通り集計 |
| `support` | 運用・問い合わせ対応 | 工数のみ記録 |
| `buffer` | リスク吸収用の予備期間 | 消費率として管理 |

### status（現在の実装）

| 値 | 表示 |
|-----|------|
| `not-started` | 未着手 |
| `in-progress` | 進行中 |
| `completed` | 完了 |
| `on-hold` | 保留 |

### status（Phase 1.5 拡張予定）

| 値 | 表示 | 色 |
|-----|------|-----|
| `not-started` | 未着手 | グレー |
| `on-track` | 順調 | 青 |
| `at-risk` | 注意 | 黄 |
| `delayed` | 遅延 | 赤 |
| `on-hold` | 保留 | 橙 |
| `completed` | 完了 | 緑 |

移行: `in-progress` → `on-track` に自動変換

---

## ID生成ルール

| 種別 | プレフィックス | 例 |
|------|---------------|-----|
| WBS | `wbs_` | `wbs_1705123456789` |
| カテゴリ | `cat_` | `cat_1705000001` |
| メンバー | `mem_` | `mem_1705000001` |
| マイルストーン | `mil_` | `mil_1705123456789` |

すべて `{prefix}_{Date.now()}` で生成。

---

## WBSコード体系

```
1           # Level 0（最上位）
├── 1.1     # Level 1
│   ├── 1.1.1  # Level 2
│   └── 1.1.2
└── 1.2
2
└── 2.1
```

- ドット区切りの数字
- `level` = ドットの数（例: "1.1.2" → level=2）
- `parentCode` = 親のコード（例: "1.1.2" の親は "1.1"）
- 同一親配下で連番を自動採番
