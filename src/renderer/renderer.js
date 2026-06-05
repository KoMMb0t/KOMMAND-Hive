'use strict';

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

let agents = [];
let activeId = null;
let selectedTemplate = null;

async function init() {
  const state = await window.hiveAPI.getState();
  agents   = state.agents   || [];
  activeId = state.activeId || null;
  renderAgentList();
  renderTemplateGrid(state.templates);
  updateHeader();
  updatePlaceholder();
}

function renderAgentList() {
  agentList.innerHTML = '';
  agents.forEach(agent => {
    const item = document.createElement('div');
    item.className = `agent-item${agent.instanceId === activeId ? ' active' : ''}`;
    item.dataset.id = agent.instanceId;
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
    activeName.textContent  = agent.name;
    activeLabel.textContent = agent.label;
    activeLabel.style.display = 'inline-block';
  } else {
    activeName.textContent    = 'No agent active';
    activeLabel.textContent   = '';
    activeLabel.style.display = 'none';
  }
}

function updatePlaceholder() {
  placeholder.style.display = (!agents.length || !activeId) ? 'flex' : 'none';
}

function openModal()  { modalOverlay.style.display = 'flex'; modalForm.style.display = 'none'; selectedTemplate = null; }
function closeModal() { modalOverlay.style.display = 'none'; selectedTemplate = null; }

// ── Events ───────────────────────────────────────────────────

btnAdd.addEventListener('click', openModal);
btnAddPlaceholder.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
btnCreate.addEventListener('click', createAgent);
inputLabel.addEventListener('keydown', e => { if (e.key === 'Enter') createAgent(); });

btnReload.addEventListener('click', () => { if (activeId) window.hiveAPI.reloadAgent(activeId); });

btnLogout.addEventListener('click', () => {
  if (!activeId) return;
  const agent = agents.find(a => a.instanceId === activeId);
  if (agent && confirm(`Log out ${agent.name} (${agent.label})?`))
    window.hiveAPI.logoutAgent(activeId);
});

btnRemove.addEventListener('click', () => {
  if (!activeId) return;
  const agent = agents.find(a => a.instanceId === activeId);
  if (agent && confirm(`Remove ${agent.name} (${agent.label})?`))
    window.hiveAPI.removeAgent(activeId);
});

btnMissions.addEventListener('click', () => window.hiveAPI.onToggleMissions?.());
btnHivemind.addEventListener('click', () => window.hiveAPI.onToggleHivemind?.());

// ── IPC callbacks ─────────────────────────────────────────────

window.hiveAPI.onAgentsLoaded(data => {
  agents   = data.agents   || [];
  activeId = data.activeId || null;
  if (data.templates) renderTemplateGrid(data.templates);
  renderAgentList();
  updateHeader();
  updatePlaceholder();
});

window.hiveAPI.onAgentSwitched(data => {
  activeId = data.activeId;
  renderAgentList();
  updateHeader();
  updatePlaceholder();
});

window.hiveAPI.onAgentRemoved(data => {
  agents   = data.agents;
  activeId = agents.length ? agents[0].instanceId : null;
  renderAgentList();
  updateHeader();
  updatePlaceholder();
});

window.hiveAPI.onShowAddDialog(openModal);

init();
