/**
 * KOMMAND Hive — Main Electron Process
 * Verwaltet Agent Cells als isolierte BrowserView-Instanzen.
 */

const { app, BrowserWindow, BrowserView, ipcMain, Menu, session } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({
  defaults: {
    windowBounds: { width: 1500, height: 900 },
    agents: [],
    activeAgentId: null
  }
});

const AGENT_TEMPLATES = [
  { id: 'manus',             name: 'Manus',            url: 'https://manus.im',               icon: 'M',  color: '#6c63ff' },
  { id: 'chatgpt',           name: 'ChatGPT',           url: 'https://chat.openai.com',        icon: 'AI', color: '#10a37f' },
  { id: 'claude',            name: 'Claude',            url: 'https://claude.ai',              icon: 'C',  color: '#cc785c' },
  { id: 'hackathon-hunter',  name: 'Hackathon Hunter',  url: 'https://github.com/KoMMb0t/hackathon-hunter', icon: '🎯', color: '#f59e0b' },
  { id: 'github',            name: 'GitHub',            url: 'https://github.com',             icon: 'G',  color: '#24292e' },
  { id: 'gmail',             name: 'Gmail',             url: 'https://mail.google.com',        icon: '✉',  color: '#ea4335' },
  { id: 'google-drive',      name: 'Google Drive',      url: 'https://drive.google.com',       icon: '📁', color: '#0f9d58' },
  { id: 'notion',            name: 'Notion',            url: 'https://notion.so',              icon: 'N',  color: '#ffffff' },
  { id: 'discord',           name: 'Discord',           url: 'https://discord.com/app',        icon: 'D',  color: '#5865f2' },
  { id: 'slack',             name: 'Slack',             url: 'https://app.slack.com',          icon: 'S',  color: '#4a154b' },
  { id: 'custom',            name: 'Custom',            url: '',                               icon: '⚙',  color: '#888888' }
];

let mainWindow = null;
let agentViews = new Map();
let activeAgentId = null;

function createMainWindow() {
  const { width, height } = store.get('windowBounds');

  mainWindow = new BrowserWindow({
    width, height,
    minWidth: 1000,
    minHeight: 650,
    title: 'KOMMAND Hive',
    backgroundColor: '#0a0a14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.on('resize', () => {
    store.set('windowBounds', mainWindow.getBounds());
    updateActiveViewBounds();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    agentViews.clear();
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.webContents.on('did-finish-load', () => {
    loadSavedAgents();
    setupMenu();
  });
}

function getContentBounds() {
  const [w, h] = mainWindow.getContentSize();
  const SIDEBAR = 270;
  const HEADER  = 52;
  return { x: SIDEBAR, y: HEADER, width: w - SIDEBAR, height: h - HEADER };
}

function createAgent(templateId, label, customUrl) {
  const tpl = AGENT_TEMPLATES.find(t => t.id === templateId);
  const instanceId = `${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const url = customUrl || (tpl ? tpl.url : '');

  const agent = {
    instanceId,
    templateId,
    name: tpl ? tpl.name : 'Custom',
    label: label || `Cell ${agentViews.size + 1}`,
    url,
    icon: tpl ? tpl.icon : '⚙',
    color: tpl ? tpl.color : '#888888',
    partition: `persist:${instanceId}`,
    createdAt: Date.now()
  };

  const view = new BrowserView({
    webPreferences: {
      partition: agent.partition,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  if (url) view.webContents.loadURL(url);
  agentViews.set(instanceId, view);

  const agents = store.get('agents');
  agents.push(agent);
  store.set('agents', agents);

  return agent;
}

function loadSavedAgents() {
  const agents = store.get('agents');

  agents.forEach(agent => {
    const view = new BrowserView({
      webPreferences: {
        partition: agent.partition,
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true
      }
    });
    if (agent.url) view.webContents.loadURL(agent.url);
    agentViews.set(agent.instanceId, view);
  });

  const savedActive = store.get('activeAgentId');
  if (savedActive && agentViews.has(savedActive)) {
    switchToAgent(savedActive);
  }

  mainWindow.webContents.send('agents-loaded', {
    agents,
    activeId: savedActive,
    templates: AGENT_TEMPLATES
  });
}

function switchToAgent(instanceId) {
  agentViews.forEach(v => mainWindow.removeBrowserView(v));

  const view = agentViews.get(instanceId);
  if (!view) return;

  activeAgentId = instanceId;
  store.set('activeAgentId', instanceId);

  mainWindow.addBrowserView(view);
  view.setBounds(getContentBounds());
  view.setAutoResize({ width: true, height: true });

  mainWindow.webContents.send('agent-switched', { activeId: instanceId });
}

function removeAgent(instanceId) {
  const view = agentViews.get(instanceId);
  if (view) {
    mainWindow.removeBrowserView(view);
    const agent = store.get('agents').find(a => a.instanceId === instanceId);
    if (agent) session.fromPartition(agent.partition).clearStorageData();
    agentViews.delete(instanceId);
  }

  const agents = store.get('agents').filter(a => a.instanceId !== instanceId);
  store.set('agents', agents);

  if (activeAgentId === instanceId) {
    activeAgentId = null;
    if (agents.length > 0) switchToAgent(agents[0].instanceId);
  }

  mainWindow.webContents.send('agent-removed', { instanceId, agents });
}

function updateActiveViewBounds() {
  if (!activeAgentId || !mainWindow) return;
  const view = agentViews.get(activeAgentId);
  if (view) view.setBounds(getContentBounds());
}

function cycleAgent(dir) {
  const agents = store.get('agents');
  if (!agents.length) return;
  const idx = agents.findIndex(a => a.instanceId === activeAgentId);
  switchToAgent(agents[(idx + dir + agents.length) % agents.length].instanceId);
}

function setupMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New Agent Cell', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('show-add-dialog') },
        { type: 'separator' },
        { label: 'Reload Active', accelerator: 'CmdOrCtrl+R', click: () => { if (activeAgentId) agentViews.get(activeAgentId)?.webContents.reload(); } },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Agents',
      submenu: [
        { label: 'Next Cell',     accelerator: 'CmdOrCtrl+Tab',       click: () => cycleAgent(1)  },
        { label: 'Previous Cell', accelerator: 'CmdOrCtrl+Shift+Tab', click: () => cycleAgent(-1) }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Mission Board', accelerator: 'CmdOrCtrl+M', click: () => mainWindow.webContents.send('toggle-missions') },
        { label: 'Hivemind',      accelerator: 'CmdOrCtrl+H', click: () => mainWindow.webContents.send('toggle-hivemind') },
        { type: 'separator' },
        { label: 'DevTools (Cell)', click: () => { if (activeAgentId) agentViews.get(activeAgentId)?.webContents.openDevTools(); } },
        { label: 'DevTools (App)',  click: () => mainWindow.webContents.openDevTools() },
        { type: 'separator' },
        { label: 'Fullscreen', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

// ── IPC ─────────────────────────────────────────────────────

ipcMain.handle('get-templates', () => AGENT_TEMPLATES);
ipcMain.handle('get-state', () => ({ agents: store.get('agents'), activeId: activeAgentId, templates: AGENT_TEMPLATES }));

ipcMain.handle('create-agent', (_, { templateId, label, customUrl }) => {
  const agent = createAgent(templateId, label, customUrl);
  if (agent) switchToAgent(agent.instanceId);
  return agent;
});

ipcMain.on('switch-agent',  (_, id) => switchToAgent(id));
ipcMain.on('remove-agent',  (_, id) => removeAgent(id));
ipcMain.on('reload-agent',  (_, id) => agentViews.get(id)?.webContents.reload());
ipcMain.on('logout-agent',  (_, id) => {
  const agent = store.get('agents').find(a => a.instanceId === id);
  if (!agent) return;
  session.fromPartition(agent.partition).clearStorageData().then(() => {
    agentViews.get(id)?.webContents.loadURL(agent.url);
    mainWindow.webContents.send('agent-logged-out', { instanceId: id });
  });
});

// ── Lifecycle ────────────────────────────────────────────────

app.on('ready', createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!mainWindow) createMainWindow(); });
