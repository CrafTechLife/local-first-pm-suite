import { state } from '../state.js';
import { escapeHtml } from '../utils/dom.js';

export function renderGanttChart() {
    const container = document.getElementById('ganttChart');
    if (!container) return;

    if (state.wbsItems.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">WBSがありません</div></div>';
        return;
    }

    // 日付範囲を計算
    const dates = state.wbsItems
        .filter(w => w.plannedStart || w.plannedEnd)
        .flatMap(w => [w.plannedStart, w.plannedEnd].filter(Boolean))
        .map(d => new Date(d));

    if (dates.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">日付が設定されていません</div></div>';
        return;
    }

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // 前後に余裕を持たせる
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    const dayCount = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const dayWidth = 40;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ヘッダー（日付）
    let datesHtml = '';
    for (let i = 0; i < dayCount; i++) {
        const date = new Date(minDate);
        date.setDate(date.getDate() + i);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isToday = date.getTime() === today.getTime();

        datesHtml += `
      <div class="gantt-date ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}">
        ${date.getDate()}
      </div>
    `;
    }

    // 行（WBSごと）
    let labelsHtml = '';
    let barsHtml = '';

    state.wbsItems.forEach(w => {
        const indent = '　'.repeat(w.level || 0);
        labelsHtml += `
      <div class="gantt-row-label">
        <span class="wbs-type-badge ${w.type}" style="width: 3px; height: 16px;"></span>
        <span>${indent}${w.code} ${escapeHtml(w.name)}</span>
      </div>
    `;

        let barHtml = '';
        if (w.plannedStart && w.plannedEnd) {
            const start = new Date(w.plannedStart);
            const end = new Date(w.plannedEnd);
            const startOffset = Math.floor((start - minDate) / (1000 * 60 * 60 * 24));
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            if (w.milestone) {
                barHtml = `<div class="gantt-milestone" style="left: ${startOffset * dayWidth + dayWidth / 2 - 8}px;"></div>`;
            } else {
                barHtml = `
          <div class="gantt-bar ${w.type}" style="left: ${startOffset * dayWidth}px; width: ${duration * dayWidth - 4}px;">
            <div class="progress-overlay" style="width: ${w.progress}%;"></div>
            <span style="position: relative; z-index: 1;">${w.progress}%</span>
          </div>
        `;
            }
        }

        barsHtml += `<div class="gantt-row">${barHtml}</div>`;
    });

    container.innerHTML = `
    <div class="gantt-header">
      <div class="gantt-labels" style="padding: 8px 12px; font-size: 11px; color: var(--text-secondary);">
        WBS
      </div>
      <div class="gantt-timeline">
        <div class="gantt-dates" style="width: ${dayCount * dayWidth}px;">
          ${datesHtml}
        </div>
      </div>
    </div>
    <div class="gantt-rows">
      <div class="gantt-row-labels">
        ${labelsHtml}
      </div>
      <div class="gantt-row-bars" style="overflow-x: auto;">
        <div style="width: ${dayCount * dayWidth}px;">
          ${barsHtml}
        </div>
      </div>
    </div>
  `;
}
