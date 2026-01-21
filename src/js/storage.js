import { state, updateState } from './state.js';
import { showToast } from './utils/dom.js';

export async function selectProjectFolder() {
    try {
        const handle = await window.showDirectoryPicker({
            mode: 'readwrite'
        });
        updateState({ directoryHandle: handle });
        return handle;
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error(err);
            showToast('フォルダの選択に失敗しました', 'error');
        }
        throw err;
    }
}

export async function loadProjects() {
    const projects = [];
    try {
        for await (const entry of state.directoryHandle.values()) {
            if (entry.kind === 'directory') {
                try {
                    const projectDir = await state.directoryHandle.getDirectoryHandle(entry.name);
                    const projectFile = await projectDir.getFileHandle('project.json');
                    const file = await projectFile.getFile();
                    const content = await file.text();
                    const project = JSON.parse(content);
                    projects.push(project);
                } catch (e) {
                    // project.jsonがなければスキップ
                }
            }
        }
        updateState({ projects });
        return projects;
    } catch (err) {
        console.error('Load projects error:', err);
        throw err;
    }
}


export async function loadMasterData() {
    if (!state.currentProject) return;

    try {
        const projectDir = await state.directoryHandle.getDirectoryHandle(state.currentProject.id);

        // Load Categories
        try {
            const file = await projectDir.getFileHandle('categories.json');
            const content = await (await file.getFile()).text();
            updateState({ categories: JSON.parse(content) });
        } catch (e) {
            updateState({ categories: [] });
        }

        // Load Members
        try {
            const file = await projectDir.getFileHandle('members.json');
            const content = await (await file.getFile()).text();
            updateState({ members: JSON.parse(content) });
        } catch (e) {
            updateState({ members: [] });
        }

        // Load Milestones
        try {
            const file = await projectDir.getFileHandle('milestones.json');
            const content = await (await file.getFile()).text();
            updateState({ milestones: JSON.parse(content) });
        } catch (e) {
            updateState({ milestones: [] });
        }

    } catch (err) {
        console.error('Load Master Data error:', err);
        // showToast('マスタデータの読み込みに失敗しました', 'error'); // Optional: quiet fail if files don't exist yet
    }
}

export async function saveCategories(categories) {
    try {
        const projectDir = await state.directoryHandle.getDirectoryHandle(state.currentProject.id);
        const fileHandle = await projectDir.getFileHandle('categories.json', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(categories, null, 2));
        await writable.close();
        updateState({ categories });
    } catch (err) {
        console.error('Save Categories error:', err);
        showToast('カテゴリの保存に失敗しました', 'error');
        throw err;
    }
}

export async function saveMembers(members) {
    try {
        const projectDir = await state.directoryHandle.getDirectoryHandle(state.currentProject.id);
        const fileHandle = await projectDir.getFileHandle('members.json', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(members, null, 2));
        await writable.close();
        updateState({ members });
    } catch (err) {
        console.error('Save Members error:', err);
        showToast('メンバーの保存に失敗しました', 'error');
        throw err;
    }
}

export async function saveMilestones(milestones) {
    try {
        const projectDir = await state.directoryHandle.getDirectoryHandle(state.currentProject.id);
        const fileHandle = await projectDir.getFileHandle('milestones.json', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(milestones, null, 2));
        await writable.close();
        updateState({ milestones });
    } catch (err) {
        console.error('Save Milestones error:', err);
        showToast('マイルストーンの保存に失敗しました', 'error');
        throw err;
    }
}

export async function loadWbsItems() {
    if (!state.currentProject) return [];

    // Load Master Data as well
    await loadMasterData();

    const wbsItems = [];

    try {
        const projectDir = await state.directoryHandle.getDirectoryHandle(state.currentProject.id);
        const wbsDir = await projectDir.getDirectoryHandle('wbs');

        for await (const entry of wbsDir.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                const file = await entry.getFile();
                const content = await file.text();
                const wbs = JSON.parse(content);
                wbsItems.push(wbs);
            }
        }

        // コードでソート
        wbsItems.sort((a, b) => compareWbsCode(a.code, b.code));
        updateState({ wbsItems });
        return wbsItems;
    } catch (err) {
        console.error('Load WBS error:', err);
        showToast('WBSの読み込みに失敗しました', 'error');
        throw err;
    }
}

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

export async function saveWbs(wbs) {
    try {
        const projectDir = await state.directoryHandle.getDirectoryHandle(state.currentProject.id);
        const wbsDir = await projectDir.getDirectoryHandle('wbs');
        const fileName = `${wbs.id}.json`;
        const fileHandle = await wbsDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(wbs, null, 2));
        await writable.close();
        showToast(wbs.id.startsWith('wbs_') ? 'WBSを更新しました' : 'WBSを追加しました', 'success');
    } catch (err) {
        console.error('Save WBS error:', err);
        showToast('WBSの保存に失敗しました', 'error');
        throw err;
    }
}

export async function deleteWbs(wbsId) {
    try {
        const projectDir = await state.directoryHandle.getDirectoryHandle(state.currentProject.id);
        const wbsDir = await projectDir.getDirectoryHandle('wbs');
        await wbsDir.removeEntry(`${wbsId}.json`);
        showToast('WBSを削除しました', 'success');
    } catch (err) {
        console.error('Delete WBS error:', err);
        showToast('WBSの削除に失敗しました', 'error');
        throw err;
    }
}

export async function createProject(project) {
    try {
        const projectDir = await state.directoryHandle.getDirectoryHandle(project.id, { create: true });
        await projectDir.getDirectoryHandle('wbs', { create: true });

        const projectFile = await projectDir.getFileHandle('project.json', { create: true });
        const writable = await projectFile.createWritable();
        await writable.write(JSON.stringify(project, null, 2));
        await writable.close();
        return project;
    } catch (err) {
        console.error('Create project error:', err);
        throw err;
    }
}
