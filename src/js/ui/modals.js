import { state, updateState } from '../state.js';
import { state, updateState } from '../state.js';
import { saveCategories, saveMembers, saveMilestones } from '../storage.js';
import { showToast } from '../utils/dom.js';
import { showToast } from '../utils/dom.js';

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
    document.getElementById('wbsCategory').value = '';
    document.getElementById('wbsAssignee').value = '';
    document.getElementById('wbsStartDate').value = '';
    document.getElementById('wbsEndDate').value = '';
    document.getElementById('wbsEffort').value = '';
    document.getElementById('wbsProgress').value = '0';
    document.getElementById('wbsMilestone').checked = false;
    document.getElementById('wbsNote').value = '';

    window.app.updateParentSelect(parentCode);
    window.app.updateDependenciesSelect();
    window.app.updateCategorySelect();
    window.app.updateMemberSelect();

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
    document.getElementById('wbsCategory').value = wbs.categoryId || '';
    // Assignee is handled by updateMemberSelect to include non-registered members

    document.getElementById('wbsStartDate').value = wbs.plannedStart || '';
    document.getElementById('wbsEndDate').value = wbs.plannedEnd || '';
    document.getElementById('wbsEffort').value = wbs.plannedEffort || '';
    document.getElementById('wbsProgress').value = wbs.progress || 0;
    document.getElementById('wbsMilestone').checked = wbs.milestone || false;
    document.getElementById('wbsNote').value = wbs.note || '';

    window.app.updateParentSelect(wbs.parentCode);
    window.app.updateDependenciesSelect(wbs.dependencies);
    window.app.updateDependenciesSelect(wbs.dependencies);
    window.app.updateCategorySelect(wbs.categoryId);
    window.app.updateMemberSelect(wbs.assignee);

    document.getElementById('wbsModal').classList.add('show');
}

export function closeWbsModal() {
    document.getElementById('wbsModal').classList.remove('show');
    updateState({ editingWbsId: null });
}

// Category Management
export function showCategoryModal() {
    renderCategoryList();
    document.getElementById('catName').value = '';
    document.getElementById('catColor').value = '#1d9bf0';
    document.getElementById('categoryModal').classList.add('show');
}

export function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('show');
}

export async function saveCategory() {
    const name = document.getElementById('catName').value.trim();
    const color = document.getElementById('catColor').value;

    if (!name) {
        showToast('カテゴリ名を入力してください', 'error');
        return;
    }

    const newCategory = {
        id: `cat_${Date.now()}`,
        name,
        color
    };

    const categories = [...state.categories, newCategory];
    await saveCategories(categories);

    document.getElementById('catName').value = '';
    renderCategoryList();
    showToast('カテゴリを追加しました', 'success');
}

export async function deleteCategory(id) {
    if (!confirm('このカテゴリを削除しますか？')) return;

    const categories = state.categories.filter(c => c.id !== id);
    await saveCategories(categories);
    renderCategoryList();
    showToast('カテゴリを削除しました', 'success');
}

function renderCategoryList() {
    const list = document.getElementById('categoryList');
    list.innerHTML = '';

    if (state.categories.length === 0) {
        list.innerHTML = '<div class="empty-state-desc">カテゴリが登録されていません</div>';
        return;
    }

    state.categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'wbs-item';
        div.style.gridTemplateColumns = 'auto 100px';
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 16px; height: 16px; border-radius: 4px; background: ${cat.color};"></div>
                <span>${cat.name}</span>
            </div>
            <button class="btn btn-icon btn-small" style="color: var(--accent-red);" onclick="window.app.deleteCategory('${cat.id}')">削除</button>
        `;
        list.appendChild(div);
    });
}

// Milestone Management
export function showMilestoneModal() {
    renderMilestoneList();
    document.getElementById('milName').value = '';
    document.getElementById('milDate').value = '';
    document.getElementById('milDesc').value = '';
    document.getElementById('milestoneModal').classList.add('show');
}

export function closeMilestoneModal() {
    document.getElementById('milestoneModal').classList.remove('show');
}

export async function saveMilestone() {
    const name = document.getElementById('milName').value.trim();
    const date = document.getElementById('milDate').value;
    const description = document.getElementById('milDesc').value.trim();

    if (!name || !date) {
        showToast('マイルストーン名と日付は必須です', 'error');
        return;
    }

    const newMilestone = {
        id: `mil_${Date.now()}`,
        name,
        date,
        description
    };

    const milestones = [...state.milestones, newMilestone];
    await saveMilestones(milestones);

    document.getElementById('milName').value = '';
    document.getElementById('milDate').value = '';
    document.getElementById('milDesc').value = '';
    renderMilestoneList();
    showToast('マイルストーンを追加しました', 'success');
}

export async function deleteMilestone(id) {
    if (!confirm('このマイルストーンを削除しますか？')) return;

    const milestones = state.milestones.filter(m => m.id !== id);
    await saveMilestones(milestones);
    renderMilestoneList();
    showToast('マイルストーンを削除しました', 'success');
}

function renderMilestoneList() {
    const list = document.getElementById('milestoneList');
    list.innerHTML = '';

    if (state.milestones.length === 0) {
        list.innerHTML = '<div class="empty-state-desc">マイルストーンが登録されていません</div>';
        return;
    }

    state.milestones.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(mil => {
        const div = document.createElement('div');
        div.className = 'wbs-item';
        div.style.gridTemplateColumns = '120px auto 100px';
        div.innerHTML = `
            <div>${mil.date}</div>
            <div>
                <span style="font-weight: bold;">${mil.name}</span>
                <div style="font-size: 12px; color: var(--text-secondary);">${mil.description || ''}</div>
            </div>
            <button class="btn btn-icon btn-small" style="color: var(--accent-red);" onclick="window.app.deleteMilestone('${mil.id}')">削除</button>
        `;
        list.appendChild(div);
    });
}

// Member Management
export function showMemberModal() {
    renderMemberList();
    document.getElementById('memName').value = '';
    document.getElementById('memRole').value = '';
    document.getElementById('memberModal').classList.add('show');
}

export function closeMemberModal() {
    document.getElementById('memberModal').classList.remove('show');
}

export async function saveMember() {
    const name = document.getElementById('memName').value.trim();
    const role = document.getElementById('memRole').value.trim();

    if (!name) {
        showToast('名前を入力してください', 'error');
        return;
    }

    const newMember = {
        id: `mem_${Date.now()}`,
        name,
        role
    };

    const members = [...state.members, newMember];
    await saveMembers(members);

    document.getElementById('memName').value = '';
    document.getElementById('memRole').value = '';
    renderMemberList();
    showToast('メンバーを追加しました', 'success');
}

export async function deleteMember(id) {
    if (!confirm('このメンバーを削除しますか？')) return;

    const members = state.members.filter(m => m.id !== id);
    await saveMembers(members);
    renderMemberList();
    showToast('メンバーを削除しました', 'success');
}

function renderMemberList() {
    const list = document.getElementById('memberList');
    list.innerHTML = '';

    if (state.members.length === 0) {
        list.innerHTML = '<div class="empty-state-desc">メンバーが登録されていません</div>';
        return;
    }

    state.members.forEach(mem => {
        const div = document.createElement('div');
        div.className = 'wbs-item';
        div.style.gridTemplateColumns = 'auto 100px 100px';
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${mem.name}</span>
            </div>
            <div style="color: var(--text-secondary); font-size: 13px;">${mem.role || '-'}</div>
            <button class="btn btn-icon btn-small" style="color: var(--accent-red);" onclick="window.app.deleteMember('${mem.id}')">削除</button>
        `;
        list.appendChild(div);
    });
}
