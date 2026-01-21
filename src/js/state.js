export const state = {
    directoryHandle: null,
    currentProject: null,
    projects: [],
    wbsItems: [],
    categories: [],
    members: [],
    milestones: [],
    expandedNodes: new Set(),
    editingWbsId: null,
    contextMenuTarget: null,
    currentView: 'tree',
    autoReloadInterval: null
};

export function updateState(newState) {
    Object.assign(state, newState);
}
