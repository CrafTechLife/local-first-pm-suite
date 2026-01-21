# ビジネスロジック

## 進捗計算

### 手動入力（現在の実装）

```javascript
// progressCalcMethod: 'manual'
// ユーザーが直接 0-100% を入力
```

### 全体進捗（サマリー表示）

**実装箇所**: `src/main.js` - `updateSummary()`

```javascript
// 工数加重平均
const totalEffort = wbsItems.reduce((sum, w) => sum + (w.plannedEffort || 1), 0);
const weightedProgress = wbsItems.reduce((sum, w) => {
    return sum + (w.plannedEffort || 1) * (w.progress || 0);
}, 0);
const avgProgress = totalEffort > 0 ? Math.round(weightedProgress / totalEffort) : 0;
```

**計算式**:
```
全体進捗 = Σ(各WBSの工数 × 各WBSの進捗) / Σ(各WBSの工数)
```

- 工数未設定のWBSは `1` として計算
- `type: support` のWBSも集計対象に含まれる

### タスクベース（Phase 2 で実装予定）

```javascript
// progressCalcMethod: 'taskBased'
// WBSノードの進捗 = 配下タスクの加重平均

// 例：WBS「1.1 要件定義」
// ├── タスクA（見積2日）完了 → 100%
// ├── タスクB（見積1日）進行中 → 50%
// └── タスクC（見積1日）未着手 → 0%
//
// 進捗 = (2×100% + 1×50% + 1×0%) / (2+1+1) = 62.5%
```

---

## ステータス自動設定

**実装箇所**: `src/main.js` - `handleSaveWbs()`

```javascript
status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started'
```

| 条件 | 設定されるステータス |
|------|---------------------|
| `progress === 100` | `completed` |
| `progress > 0` | `in-progress` |
| `progress === 0` | `not-started` |

**注意**: `on-hold` は自動設定されない（ユーザーが明示的に設定）

### Phase 1.5 拡張予定

| 条件 | 提案ステータス |
|------|---------------|
| `progress === 0` | `not-started` |
| `progress === 100` | `completed` |
| `plannedEnd < today && progress < 100` | `delayed` を提案 |
| その他 | `on-track` |

---

## 遅延判定

**実装箇所**: `src/main.js` - `updateSummary()`

```javascript
const delayed = wbsItems.filter(w => {
    return w.plannedEnd && new Date(w.plannedEnd) < new Date() && w.status !== 'completed';
}).length;
```

**条件**:
1. 予定終了日（`plannedEnd`）が設定されている
2. 予定終了日が今日より前
3. ステータスが `completed` でない

---

## WBSコード自動採番

**実装箇所**: `src/main.js`

### 最上位コード

```javascript
function getNextTopCode() {
    const topItems = state.wbsItems.filter(w => !w.parentCode);
    if (topItems.length === 0) return '1';
    const maxCode = Math.max(...topItems.map(w => parseInt(w.code.split('.')[0])));
    return String(maxCode + 1);
}
```

### 子コード

```javascript
function getNextChildCode(parentCode) {
    const children = state.wbsItems.filter(w => w.parentCode === parentCode);
    if (children.length === 0) return `${parentCode}.1`;
    const maxChild = Math.max(...children.map(w => {
        const parts = w.code.split('.');
        return parseInt(parts[parts.length - 1]);
    }));
    return `${parentCode}.${maxChild + 1}`;
}
```

---

## WBSコードソート

**実装箇所**: `src/js/storage.js` - `compareWbsCode()`

```javascript
export function compareWbsCode(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;
        if (numA !== numB) return numA - numB;
    }
    return 0;
}
```

**ソート例**:
```
1 < 1.1 < 1.2 < 1.10 < 2 < 2.1 < 10
```

---

## 階層構造の構築

**実装箇所**: `src/js/ui/tree.js` - `buildTree()`

```javascript
function buildTree() {
    const map = new Map();
    const roots = [];

    // 全ノードをマップに登録
    state.wbsItems.forEach(w => {
        map.set(w.code, { ...w, children: [] });
    });

    // 親子関係を構築
    state.wbsItems.forEach(w => {
        const node = map.get(w.code);
        if (w.parentCode && map.has(w.parentCode)) {
            map.get(w.parentCode).children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}
```

---

## 子孫判定

**実装箇所**: `src/main.js` - `isDescendant()`

```javascript
function isDescendant(childCode, parentCode) {
    if (!parentCode) return false;
    return childCode.startsWith(parentCode + '.');
}
```

**用途**: WBS編集時、親WBS選択のドロップダウンから自分自身と子孫を除外

---

## 日付範囲計算（ガントチャート）

**実装箇所**: `src/js/ui/gantt.js` - `renderGanttChart()`

```javascript
// WBSとマイルストーンの全日付を収集
const wbsDates = state.wbsItems
    .filter(w => w.plannedStart || w.plannedEnd)
    .flatMap(w => [w.plannedStart, w.plannedEnd].filter(Boolean));

const milestoneDates = state.milestones.map(m => m.date);
const dates = [...wbsDates, ...milestoneDates].map(d => new Date(d));

// 最小・最大日付
const minDate = new Date(Math.min(...dates));
const maxDate = new Date(Math.max(...dates));

// 前後に7日の余裕
minDate.setDate(minDate.getDate() - 7);
maxDate.setDate(maxDate.getDate() + 7);
```
