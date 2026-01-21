import { state, updateState } from '../state.js';

export function showNewProjectModal() {
    document.getElementById('projectId').value = '';
    document.getElementById('projectName').value = '';
    document.getElementById('projectDesc').value = '';
    document.getElementById('projectModal').classList.add('show');
}

export function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('show');
}

export function showAddWbsModal(parentCode = null, defaultType = 'deliverable') {
    updateState({ editingWbsId: null });
    document.getElementById('wbsModalTitle').textContent = 'WBS追加';

    // フォームリセット
    document.getElementById('wbsCode').value = parentCode ? window.app.getNextChildCode(parentCode) : window.app.getNextTopCode();
    document.getElementById('wbsType').value = defaultType;
    document.getElementById('wbsName').value = '';
    document.getElementById('wbsAssignee').value = '';
    document.getElementById('wbsStartDate').value = '';
    document.getElementById('wbsEndDate').value = '';
    document.getElementById('wbsEffort').value = '';
    document.getElementById('wbsProgress').value = '0';
    document.getElementById('wbsMilestone').checked = false;
    document.getElementById('wbsNote').value = '';

    window.app.updateParentSelect(parentCode);
    window.app.updateDependenciesSelect();

    document.getElementById('wbsModal').classList.add('show');
}

export function showEditWbsModal(wbsId) {
    const wbs = state.wbsItems.find(w => w.id === wbsId);
    if (!wbs) return;

    updateState({ editingWbsId: wbsId });
    document.getElementById('wbsModalTitle').textContent = 'WBS編集';

    document.getElementById('wbsCode').value = wbs.code;
    document.getElementById('wbsType').value = wbs.type;
    document.getElementById('wbsName').value = wbs.name;
    document.getElementById('wbsAssignee').value = wbs.assignee || '';
    document.getElementById('wbsStartDate').value = wbs.plannedStart || '';
    document.getElementById('wbsEndDate').value = wbs.plannedEnd || '';
    document.getElementById('wbsEffort').value = wbs.plannedEffort || '';
    document.getElementById('wbsProgress').value = wbs.progress || 0;
    document.getElementById('wbsMilestone').checked = wbs.milestone || false;
    document.getElementById('wbsNote').value = wbs.note || '';

    window.app.updateParentSelect(wbs.parentCode);
    window.app.updateDependenciesSelect(wbs.dependencies);

    document.getElementById('wbsModal').classList.add('show');
}

export function closeWbsModal() {
    document.getElementById('wbsModal').classList.remove('show');
    updateState({ editingWbsId: null });
}
