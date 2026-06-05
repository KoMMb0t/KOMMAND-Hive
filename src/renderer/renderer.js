'use strict';

// ── Token Provider Registry ─────────────────────────────────
const TOKEN_PROVIDERS = [
  {
    section: 'KI-Assistenten',
    items: [
      { id: 'anthropic', name: 'Claude (Anthropic)', icon: 'C', color: '#cc785c',
        desc: 'Claude API Key', placeholder: 'sk-ant-…',
        link: 'https://console.anthropic.com/settings/keys' },
      { id: 'openai', name: 'OpenAI / ChatGPT', icon: 'AI', color: '#10a37f',
        desc: 'OpenAI API Key', placeholder: 'sk-…',
        link: 'https://platform.openai.com/api-keys' },
      { id: 'manus', name: 'Manus', icon: 'M', color: '#6c63ff',
        desc: 'Manus API Key', placeholder: 'manus-…',
        link: 'https://manus.im/settings' },
    ]
  },
  {
    section: 'Cloud & Storage',
    items: [
      { id: 'github', name: 'GitHub', icon: 'G', color: '#24292e',
        desc: 'Personal Access Token', placeholder: 'ghp_…',
        link: 'https://github.com/settings/tokens/new' },
      { id: 'gdrive', name: 'Google Drive', icon: '📁', color: '#0f9d58',
        desc: 'OAuth Access Token', placeholder: 'ya29.…',
        link: 'https://console.cloud.google.com/apis/credentials' },
    ]
  },
  {
    section: 'Kommunikation',
    items: [
      { id: 'slack', name: 'Slack', icon: 'S', color: '#4a154b',
        desc: 'Bot Token', placeholder: 'xoxb-…',
        link: 'https://api.slack.com/apps' },
      { id: 'discord', name: 'Discord', icon: 'D', color: '#5865f2',
        desc: 'Bot Token', placeholder: 'MTk…',
        link: 'https://discord.com/developers/applications' },
    ]
  }
];

// ── DOM Refs ────────────────────────────────────────────────
const agentList         = document.getElementById('agent-list');
const btnAdd            = document.getElementById('btn-add');
const btnAddPlaceholder = document.getElementById('btn-add-placeholder');
const btnMissions       = document.getElementById('btn-missions');
const btnHivemind       = document.getElementById('btn-hivemind');
const modalOverlay      = document.getElementById('modal-overlay');
const modalClose        = document.getElementById('modal-close');
const templateGrid      = document.getElementById('template-grid');
const modalForm         = document.getElementById('modal-form');
const customUrlGroup    = document.getElementById('custom-url-group');
const inputLabel        = document.getElementById('input-label');
const inputUrl          = document.getElementById('input-url');
const btnCreate         = document.getElementById('btn-create');
const activeName        = document.getElementById('active-name');
const activeLabel       = document.getElementById('active-label');
const btnReload         = document.getElementById('btn-reload');
const btnLogout         = document.getElementById('btn-logout');
const btnRemove         = document.getElementById('btn-remove');
const placeholder       = document.getElementById('placeholder');
const apikeyFab         = document.getElementById('apikey-fab');
const apikeyPanel       = document.getElementById('apikey-panel');
const apikeyList        = document.getElementById('apikey-list');
const apikeyPanelClose  = document.getElementById('apikey-panel-close');
const hiveFab           = document.getElementById('hive-fab');
const hivePanel         = document.getElementById('hive-panel');
const hiveConnectBtn    = document.getElementById('hive-connect-btn');
const hiveStatus        = document.getElementById('hive-status');

let agents = [], activeId = null, selectedTemplate = null;
const savedTokens = JSON.parse(localStorage.getItem('hive-tokens') || '{}');

// ── Init ────────────────────────────────────────────────────
async function init() {
  const state = await window.hiveAPI.getState();
  agents   = state.agents   || [];
  activeId = state.activeId || null;
  renderAgentList();
  renderTemplateGrid(state.templates);
  buildApikeyPanel();
  updateHeader();
  updatePlaceholder();
}

// ── Agent List ──────────────────────────────────────────────
function renderAgentList() {
  agentList.innerHTML = '';
  agents.forEach(agent => {
    const item = document.createElement('div');
    item.className = `agent-item${agent.instanceId === activeId ? ' active' : ''}`;
    item.innerHTML = `
      <div class="agent-icon" style="background:${agent.color}">${agent.icon}</div>
      <div class="agent-info">
        <div class="agent-name">${agent.name}</div>
        <div class="agent-label">${agent.label}</div>
      </div>
      <div class="agent-dot"></div>
    `;
    item.addEventListener('click', () => window.hiveAPI.switchAgent(agent.instanceId));
    agentList.appendChild(item);
  });
}

function renderTemplateGrid(templates) {
  if (!templates) return;
  templateGrid.innerHTML = '';
  templates.forEach(tpl => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class="template-icon" style="background:${tpl.color}">${tpl.icon}</div>
      <div class="template-name">${tpl.name}</div>
    `;
    card.addEventListener('click', () => selectTemplate(tpl));
    templateGrid.appendChild(card);
  });
}

function selectTemplate(tpl) {
  selectedTemplate = tpl;
  modalForm.style.display = 'block';
  inputLabel.value = '';
  inputUrl.value = '';
  customUrlGroup.style.display = tpl.id === 'custom' ? 'block' : 'none';
  inputLabel.focus();
}

async function createAgent() {
  if (!selectedTemplate) return;
  const label     = inputLabel.value.trim() || `Cell ${agents.length + 1}`;
  const customUrl = selectedTemplate.id === 'custom' ? inputUrl.value.trim() : null;
  const agent = await window.hiveAPI.createAgent(selectedTemplate.id, label, customUrl);
  if (agent) {
    agents.push(agent);
    activeId = agent.instanceId;
    renderAgentList();
    updateHeader();
    updatePlaceholder();
    closeModal();
  }
}

function updateHeader() {
  const agent = agents.find(a => a.instanceId === activeId);
  if (agent) {
    activeName.textContent    = agent.name;
    activeLabel.textContent   = agent.label;
    activeLabel.style.display = 'inline-block';
  } else {
    activeName.textContent    = 'No agent active';
    activeLabel.style.display = 'none';
  }
}

function updatePlaceholder() {
  placeholder.style.display = (!agents.length || !activeId) ? 'flex' : 'none';
}

function openModal()  { modalOverlay.style.display = 'flex'; modalForm.style.display = 'none'; selectedTemplate = null; }
function closeModal() { modalOverlay.style.display = 'none'; selectedTemplate = null; }

// ── 🔑 API Key Panel ────────────────────────────────────────
function buildApikeyPanel() {
  apikeyList.innerHTML = '';
  TOKEN_PROVIDERS.forEach(section => {
    const title = document.createElement('div');
    title.className = 'akp-section-title';
    title.textContent = section.section;
    apikeyList.appendChild(title);

    section.items.forEach(p => {
      const saved = savedTokens[p.id] || '';
      const item = document.createElement('div');
      item.className = 'akp-item';
      item.innerHTML = `
        <div class="akp-icon" style="background:${p.color}">${p.icon}</div>
        <div class="akp-info">
          <div class="akp-name">${p.name}</div>
          <div class="akp-desc">${p.desc}</div>
          <div class="akp-input-row">
            <input type="password" class="akp-token-input" data-id="${p.id}"
              placeholder="${p.placeholder}" value="${saved}" />
            <button class="akp-go" data-link="${p.link}" title="Token holen">🔑 Get</button>
            <button class="akp-save" data-id="${p.id}" title="Speichern">✓</button>
          </div>
          <div class="akp-saved" id="saved-${p.id}">✓ Gespeichert</div>
        </div>
      `;
      apikeyList.appendChild(item);
    });
  });

  // Go-buttons open token URL
  apikeyList.querySelectorAll('.akp-go').forEach(btn => {
    btn.addEventListener('click', () => window.open(btn.dataset.link, '_blank'));
  });

  // Save buttons
  apikeyList.querySelectorAll('.akp-save').forEach(btn => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset.id;
      const input = apikeyList.querySelector(`.akp-token-input[data-id="${id}"]`);
      savedTokens[id] = input.value.trim();
      localStorage.setItem('hive-tokens', JSON.stringify(savedTokens));
      const label = document.getElementById(`saved-${id}`);
      if (label) { label.style.display = 'block'; setTimeout(() => label.style.display = 'none', 2000); }
    });
  });
}

function toggleApikeyPanel() {
  const open = apikeyPanel.style.display !== 'none';
  apikeyPanel.style.display = open ? 'none' : 'flex';
  hivePanel.style.display = 'none';
}

function toggleHivePanel() {
  const open = hivePanel.style.display !== 'none';
  hivePanel.style.display = open ? 'none' : 'block';
  apikeyPanel.style.display = 'none';
}

// ── Event Listeners ─────────────────────────────────────────
btnAdd.addEventListener('click', openModal);
btnAddPlaceholder.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
btnCreate.addEventListener('click', createAgent);
inputLabel.addEventListener('keydown', e => { if (e.key === 'Enter') createAgent(); });

btnReload.addEventListener('click', () => { if (activeId) window.hiveAPI.reloadAgent(activeId); });
btnLogout.addEventListener('click', () => {
  if (!activeId) return;
  const a = agents.find(x => x.instanceId === activeId);
  if (a && confirm(`Log out ${a.name} (${a.label})?`)) window.hiveAPI.logoutAgent(activeId);
});
btnRemove.addEventListener('click', () => {
  if (!activeId) return;
  const a = agents.find(x => x.instanceId === activeId);
  if (a && confirm(`Remove ${a.name} (${a.label})?`)) window.hiveAPI.removeAgent(activeId);
});

apikeyFab.addEventListener('click', toggleApikeyPanel);
apikeyPanelClose.addEventListener('click', () => apikeyPanel.style.display = 'none');
hiveFab.addEventListener('click', toggleHivePanel);
hiveConnectBtn.addEventListener('click', () => {
  const url = document.getElementById('hive-url-input').value.trim();
  hiveStatus.textContent = url ? `🔗 Verbinde mit ${url}…` : 'Bitte URL eingeben';
});

document.addEventListener('click', e => {
  if (!apikeyFab.contains(e.target) && !apikeyPanel.contains(e.target))
    apikeyPanel.style.display = 'none';
  if (!hiveFab.contains(e.target) && !hivePanel.contains(e.target))
    hivePanel.style.display = 'none';
});

// ── IPC callbacks ─────────────────────────────────────────────
window.hiveAPI.onAgentsLoaded(data => {
  agents = data.agents || []; activeId = data.activeId || null;
  if (data.templates) renderTemplateGrid(data.templates);
  renderAgentList(); updateHeader(); updatePlaceholder();
});
window.hiveAPI.onAgentSwitched(data => {
  activeId = data.activeId; renderAgentList(); updateHeader(); updatePlaceholder();
});
window.hiveAPI.onAgentRemoved(data => {
  agents = data.agents; activeId = agents.length ? agents[0].instanceId : null;
  renderAgentList(); updateHeader(); updatePlaceholder();
});
window.hiveAPI.onShowAddDialog(openModal);

init();
