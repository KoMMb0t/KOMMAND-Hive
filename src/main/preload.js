const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hiveAPI', {
  getTemplates:  () => ipcRenderer.invoke('get-templates'),
  getState:      () => ipcRenderer.invoke('get-state'),

  createAgent: (templateId, label, customUrl) =>
    ipcRenderer.invoke('create-agent', { templateId, label, customUrl }),

  switchAgent: (id) => ipcRenderer.send('switch-agent', id),
  removeAgent: (id) => ipcRenderer.send('remove-agent', id),
  reloadAgent: (id) => ipcRenderer.send('reload-agent', id),
  logoutAgent: (id) => ipcRenderer.send('logout-agent', id),

  onAgentsLoaded:   (cb) => ipcRenderer.on('agents-loaded',    (_, d) => cb(d)),
  onAgentSwitched:  (cb) => ipcRenderer.on('agent-switched',   (_, d) => cb(d)),
  onAgentRemoved:   (cb) => ipcRenderer.on('agent-removed',    (_, d) => cb(d)),
  onAgentLoggedOut: (cb) => ipcRenderer.on('agent-logged-out', (_, d) => cb(d)),
  onShowAddDialog:  (cb) => ipcRenderer.on('show-add-dialog',  ()     => cb()),
  onToggleMissions: (cb) => ipcRenderer.on('toggle-missions',  ()     => cb()),
  onToggleHivemind: (cb) => ipcRenderer.on('toggle-hivemind',  ()     => cb())
});
