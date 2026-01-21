import { state } from '../state.js';
import { escapeHtml } from '../utils/dom.js';
import { formatDateRange } from '../utils/date.js';

export function renderWbsTree() {
    const container = document.getElementById('wbsList');
    const emptyState = document.getElementById('emptyState');

    if (state.wbsItems.length === 0) {
        container.innerHTML = '';
        if (emptyState) {
            container.appendChild(emptyState);
            emptyState.style.display = 'block';
        }
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const tree = buildTree();
    container.innerHTML = renderTreeNodes(tree);
}

function buildTree() {
    const map = new Map();
    const roots = [];

    state.wbsItems.forEach(w => {
        map.set(w.code, { ...w, children: [] });
    });

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

function renderTreeNodes(nodes, level = 0) {
    let html = '';

    nodes.forEach(node => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = state.expandedNodes.has(node.code);
        const isOverdue = node.plannedEnd && new Date(node.plannedEnd) < new Date() && node.status !== 'completed';

        html += `
      <div class="wbs-item level-${level}" data-id="${node.id}" data-code="${node.code}"
           oncontextmenu="window.app.showContextMenu(event, '${node.id}')">
        <div class="wbs-name">
          ${hasChildren ? `
            <span class="wbs-toggle" onclick="window.app.toggleNode('${node.code}')">
              ${isExpanded ? '▼' : '▶'}
            </span>
          ` : '<span style="width: 20px;"></span>'}
          <span class="wbs-type-badge ${node.type}"></span>
          <span class="wbs-code">${node.code}</span>
          <span class="wbs-title" onclick="window.app.showEditWbsModal('${node.id}')">
            ${node.milestone ? '<span class="milestone-icon">◆</span>' : ''}
            ${escapeHtml(node.name)}
          </span>
        </div>
        <div class="wbs-assignee">${escapeHtml(node.assignee || '-')}</div>
        <div class="wbs-status ${node.status}">${getStatusLabel(node.status)}</div>
        <div class="wbs-dates ${isOverdue ? 'overdue' : ''}">
          ${formatDateRange(node.plannedStart, node.plannedEnd)}
        </div>
        <div class="progress-cell">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${node.progress}%"></div>
          </div>
          <span class="progress-text">${node.progress}%</span>
        </div>
        <div class="wbs-deps">
          ${node.dependencies?.map(d => `<span class="dep-badge">→${d}</span>`).join('') || '-'}
        </div>
        <div class="wbs-actions">
          <button class="btn-icon btn-small" onclick="window.app.showEditWbsModal('${node.id}')" title="編集">✏️</button>
          <button class="btn-icon btn-small" onclick="window.app.deleteWbs('${node.id}')" title="削除">🗑️</button>
        </div>
      </div>
    `;

        if (hasChildren && isExpanded) {
            html += renderTreeNodes(node.children, level + 1);
        }
    });

    return html;
}

function getStatusLabel(status) {
    const labels = {
        'not-started': '未着手',
        'in-progress': '進行中',
        'completed': '完了',
        'on-hold': '保留'
    };
    return labels[status] || status;
}
