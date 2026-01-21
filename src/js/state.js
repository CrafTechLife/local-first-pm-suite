export const state = {
    directoryHandle: null,
    currentProject: null,
    projects: [],
    wbsItems: [],
    expandedNodes: new Set(),
    editingWbsId: null,
    contextMenuTarget: null,
    currentView: 'tree',
    autoReloadInterval: null
};

export function updateState(newState) {
    Object.assign(state, newState);
}
