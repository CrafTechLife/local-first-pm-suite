import { state, updateState } from './js/state.js';
import {
    selectProjectFolder,
    loadProjects,
    loadWbsItems,
    saveWbs,
    deleteWbs,
    createProject
} from './js/storage.js';
import { renderWbsTree } from './js/ui/tree.js';
import { renderGanttChart } from './js/ui/gantt.js';
import {
    showNewProjectModal,
    closeProjectModal,
    showAddWbsModal,
    showEditWbsModal,
    closeWbsModal
} from './js/ui/modals.js';
import { showToast } from './js/utils/dom.js';

// Global Exposure for HTML Event Handlers
window.app = {
    selectProjectFolder: async () => {
        await selectProjectFolder();
        const userName = document.getElementById('setupUserName').value.trim() ||
            document.getElementById('userName').value.trim();
        if (!userName) {
            showToast('ユーザー名を入力してください', 'error');
            return;
        }
        localStorage.setItem('wbs_userName', userName);
        document.getElementById('userName').value = userName;
        document.getElementById('setupScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        updateConnectionStatus(true);
        await loadProjectsList();
        startAutoReload();
        showToast('フォルダに接続しました', 'success');
    },
    switchProject,
    showNewProjectModal,
    closeProjectModal,
    createProject: handleCreateProject,
    reloadData,
    saveUserName,
    switchView,
    expandAll,
    collapseAll,
    showAddWbsModal,
    showEditWbsModal,
    closeWbsModal,
    saveWbs: handleSaveWbs,
    deleteWbs: handleDeleteWbs,
    toggleNode,
    showContextMenu,
    contextMenuAction,
    // Helper for modals
    getNextTopCode,
    getNextChildCode,
    updateParentSelect,
    updateDependenciesSelect
};

async function loadProjectsList() {
    await loadProjects();
    const select = document.getElementById('projectSelect');
    select.innerHTML = '<option value="">プロジェクトを選択</option>';
    state.projects.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        select.appendChild(option);
    });

    const lastProject = localStorage.getItem('wbs_lastProject');
    if (lastProject && state.projects.find(p => p.id === lastProject)) {
        select.value = lastProject;
        await switchProject();
    }
}

async function switchProject() {
    const select = document.getElementById('projectSelect');
    const projectId = select.value;

    if (!projectId) {
        updateState({ currentProject: null, wbsItems: [] });
        renderWbsTree();
        return;
    }

    const currentProject = state.projects.find(p => p.id === projectId);
    updateState({ currentProject });
    localStorage.setItem('wbs_lastProject', projectId);

    await loadWbsItems();
    updateSummary();
    renderWbsTree();
}

async function handleCreateProject() {
    const id = document.getElementById('projectId').value.trim();
    const name = document.getElementById('projectName').value.trim();
    const desc = document.getElementById('projectDesc').value.trim();

    if (!id || !name) {
        showToast('プロジェクトIDと名前は必須です', 'error');
        return;
    }

    const project = {
        id,
        name,
        description: desc,
        createdAt: new Date().toISOString(),
        createdBy: document.getElementById('userName').value.trim()
    };

    await createProject(project);
    closeProjectModal();
    await loadProjectsList();
    document.getElementById('projectSelect').value = id;
    await switchProject();
    showToast('プロジェクトを作成しました', 'success');
}

async function handleSaveWbs() {
    const code = document.getElementById('wbsCode').value.trim();
    const name = document.getElementById('wbsName').value.trim();
    const type = document.getElementById('wbsType').value;
    const parentCode = document.getElementById('wbsParent').value;
    const assignee = document.getElementById('wbsAssignee').value.trim();
    const startDate = document.getElementById('wbsStartDate').value;
    const endDate = document.getElementById('wbsEndDate').value;
    const effort = parseFloat(document.getElementById('wbsEffort').value) || 0;
    const progress = parseInt(document.getElementById('wbsProgress').value) || 0;
    const milestone = document.getElementById('wbsMilestone').checked;
    const note = document.getElementById('wbsNote').value.trim();

    const depsSelect = document.getElementById('wbsDependencies');
    const dependencies = Array.from(depsSelect.selectedOptions).map(o => o.value);

    if (!code || !name) {
        showToast('WBSコードと名称は必須です', 'error');
        return;
    }

    const wbs = {
        id: state.editingWbsId || `wbs_${Date.now()}`,
        code,
        name,
        type,
        parentCode: parentCode || null,
        level: parentCode ? parentCode.split('.').length : 0,
        assignee,
        plannedStart: startDate || null,
        plannedEnd: endDate || null,
        plannedEffort: effort,
        actualEffort: 0,
        progress,
        progressCalcMethod: 'manual',
        milestone,
        dependencies,
        status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started',
        note,
        createdAt: state.editingWbsId ? state.wbsItems.find(w => w.id === state.editingWbsId)?.createdAt : new Date().toISOString(),
        createdBy: state.editingWbsId ? state.wbsItems.find(w => w.id === state.editingWbsId)?.createdBy : document.getElementById('userName').value.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: document.getElementById('userName').value.trim()
    };

    await saveWbs(wbs);
    closeWbsModal();
    await loadWbsItems();
    updateSummary();
    renderWbsTree();
}

async function handleDeleteWbs(wbsId) {
    if (!confirm('このWBSを削除しますか？')) return;
    await deleteWbs(wbsId);
    await loadWbsItems();
    updateSummary();
    renderWbsTree();
}

// UI Helpers
function toggleNode(code) {
    if (state.expandedNodes.has(code)) {
        state.expandedNodes.delete(code);
    } else {
        state.expandedNodes.add(code);
    }
    renderWbsTree();
}

function expandAll() {
    state.wbsItems.forEach(w => state.expandedNodes.add(w.code));
    renderWbsTree();
}

function collapseAll() {
    state.expandedNodes.clear();
    renderWbsTree();
}

function switchView(view) {
    updateState({ currentView: view });
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
    });
    document.getElementById('treeView').style.display = view === 'tree' ? 'block' : 'none';
    document.getElementById('ganttView').style.display = view === 'gantt' ? 'block' : 'none';
    if (view === 'gantt') renderGanttChart();
}

function updateSummary() {
    const total = state.wbsItems.length;
    const completed = state.wbsItems.filter(w => w.status === 'completed').length;
    const delayed = state.wbsItems.filter(w => {
        return w.plannedEnd && new Date(w.plannedEnd) < new Date() && w.status !== 'completed';
    }).length;

    const totalEffort = state.wbsItems.reduce((sum, w) => sum + (w.plannedEffort || 1), 0);
    const weightedProgress = state.wbsItems.reduce((sum, w) => {
        return sum + (w.plannedEffort || 1) * (w.progress || 0);
    }, 0);
    const avgProgress = totalEffort > 0 ? Math.round(weightedProgress / totalEffort) : 0;

    document.getElementById('totalProgress').textContent = `${avgProgress}%`;
    document.getElementById('totalItems').textContent = total;
    document.getElementById('delayedItems').textContent = delayed;
    document.getElementById('completedItems').textContent = completed;
}

function updateConnectionStatus(connected) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    if (dot) dot.classList.toggle('connected', connected);
    if (text) text.textContent = connected ? '接続中' : '未接続';
}

function startAutoReload() {
    if (state.autoReloadInterval) clearInterval(state.autoReloadInterval);
    updateState({ autoReloadInterval: setInterval(reloadData, 60000) });
}

async function reloadData() {
    if (!state.directoryHandle || !state.currentProject) return;
    await loadWbsItems();
    updateSummary();
    renderWbsTree();
    showToast('データを更新しました', 'info');
}

function saveUserName() {
    const userName = document.getElementById('userName').value.trim();
    if (userName) localStorage.setItem('wbs_userName', userName);
}

// Modal Helpers
function getNextTopCode() {
    const topItems = state.wbsItems.filter(w => !w.parentCode);
    if (topItems.length === 0) return '1';
    const maxCode = Math.max(...topItems.map(w => parseInt(w.code.split('.')[0])));
    return String(maxCode + 1);
}

function getNextChildCode(parentCode) {
    const children = state.wbsItems.filter(w => w.parentCode === parentCode);
    if (children.length === 0) return `${parentCode}.1`;
    const maxChild = Math.max(...children.map(w => {
        const parts = w.code.split('.');
        return parseInt(parts[parts.length - 1]);
    }));
    return `${parentCode}.${maxChild + 1}`;
}

function updateParentSelect(selectedCode = null) {
    const select = document.getElementById('wbsParent');
    if (!select) return;
    select.innerHTML = '<option value="">なし（最上位）</option>';
    state.wbsItems.forEach(w => {
        if (state.editingWbsId && (w.id === state.editingWbsId || isDescendant(w.code, state.wbsItems.find(item => item.id === state.editingWbsId)?.code))) return;
        const option = document.createElement('option');
        option.value = w.code;
        option.textContent = `${w.code} ${w.name}`;
        if (w.code === selectedCode) option.selected = true;
        select.appendChild(option);
    });
}

function updateDependenciesSelect(selectedDeps = []) {
    const select = document.getElementById('wbsDependencies');
    if (!select) return;
    select.innerHTML = '';
    state.wbsItems.forEach(w => {
        if (state.editingWbsId && w.id === state.editingWbsId) return;
        const option = document.createElement('option');
        option.value = w.code;
        option.textContent = `${w.code} ${w.name}`;
        if (selectedDeps.includes(w.code)) option.selected = true;
        select.appendChild(option);
    });
}

function isDescendant(childCode, parentCode) {
    if (!parentCode) return false;
    return childCode.startsWith(parentCode + '.');
}

// Context Menu
function showContextMenu(event, wbsId) {
    event.preventDefault();
    updateState({ contextMenuTarget: wbsId });
    const menu = document.getElementById('contextMenu');
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    menu.classList.add('show');
}

function contextMenuAction(action) {
    if (!state.contextMenuTarget) return;
    const wbs = state.wbsItems.find(w => w.id === state.contextMenuTarget);
    switch (action) {
        case 'edit': showEditWbsModal(state.contextMenuTarget); break;
        case 'addChild': showAddWbsModal(wbs?.code); break;
        case 'duplicate': duplicateWbs(state.contextMenuTarget); break;
        case 'delete': handleDeleteWbs(state.contextMenuTarget); break;
    }
    document.getElementById('contextMenu').classList.remove('show');
    updateState({ contextMenuTarget: null });
}

async function duplicateWbs(wbsId) {
    const original = state.wbsItems.find(w => w.id === wbsId);
    if (!original) return;
    const newCode = original.parentCode ? getNextChildCode(original.parentCode) : getNextTopCode();
    const now = new Date().toISOString();
    const userName = document.getElementById('userName').value.trim();
    const newWbs = {
        ...original,
        id: `wbs_${Date.now()}`,
        code: newCode,
        name: `${original.name} (コピー)`,
        progress: 0,
        status: 'not-started',
        createdAt: now,
        createdBy: userName,
        updatedAt: now,
        updatedBy: userName
    };
    await saveWbs(newWbs);
    await loadWbsItems();
    updateSummary();
    renderWbsTree();
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const savedUserName = localStorage.getItem('wbs_userName');
    if (savedUserName) {
        const setupUser = document.getElementById('setupUserName');
        const mainUser = document.getElementById('userName');
        if (setupUser) setupUser.value = savedUserName;
        if (mainUser) mainUser.value = savedUserName;
    }
    document.addEventListener('click', () => {
        const menu = document.getElementById('contextMenu');
        if (menu) menu.classList.remove('show');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeWbsModal();
            closeProjectModal();
        }
    });
});
