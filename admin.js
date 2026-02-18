// admin.js — Admin panel management

import { applyTheme, buildThemeGrid, populateThemeEditor, readThemeEditor } from './theme.js';

let _config = {};
let _previewConfig = null;
let _onSave = null;
let _onPreview = null;
let _onDiscard = null;
let _rerender = null;

export function initAdmin(config, callbacks) {
  _config = config;
  _onSave = callbacks.onSave;
  _onPreview = callbacks.onPreview;
  _onDiscard = callbacks.onDiscard;
  _rerender = callbacks.rerender;

  setupTabs();
  setupAdminToggle();
  setupDesignTab();
  setupThemeTab();
  setupFolderTab(callbacks.onFolderLoad);
  setupFooterButtons();
  populateAdmin();
  // Note: renderFieldsTab() is called inside populateAdmin()
}

function setupAdminToggle() {
  const btn = document.getElementById('admin-toggle-btn');
  const panel = document.getElementById('admin-panel');
  if (!btn) return;
  btn.addEventListener('click', () => {
    panel.classList.toggle('admin-open');
    btn.textContent = panel.classList.contains('admin-open') ? '× Admin' : '⚙ Admin';
  });
}

function setupTabs() {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('tab-active'));
      document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('tab-active'));
      btn.classList.add('tab-active');
      const pane = document.getElementById('tab-' + btn.dataset.tab);
      if (pane) pane.classList.add('tab-active');
    });
  });
}

function populateAdmin() {
  // Design tab
  setVal('admin-store-name', _config.storeName);
  setVal('admin-hero-title', _config.heroTitle);
  setVal('admin-hero-sub', _config.heroSub);

  // Theme tab
  refreshThemeGrid();
  const theme = _config.themes[_config.currentTheme] || {};
  populateThemeEditor(theme);
  setupColorSyncs();
  setEditorReadOnly(isBuiltin(_config.currentTheme));

  // Contact tab
  ['email','phone','whatsapp','wechat','telegram','instagram','website'].forEach(f => {
    setVal('admin-' + f, _config[f]);
  });

  // Fields tab
  renderFieldsTab();

  // Settings indicator
  updateSettingsIndicator(_config._loaded);
}

function setupDesignTab() {
  // Live preview on input
  ['admin-store-name','admin-hero-title','admin-hero-sub'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      if (id === 'admin-store-name') document.getElementById('store-name-display').textContent = el.value;
      if (id === 'admin-hero-title') document.getElementById('hero-title-display').textContent = el.value;
      if (id === 'admin-hero-sub') document.getElementById('hero-sub-display').textContent = el.value;
    });
  });
}

const BUILTIN_THEMES = ['editorial', 'noir'];

function isBuiltin(id) {
  return BUILTIN_THEMES.includes(id);
}

function setEditorReadOnly(readonly) {
  const editor = document.getElementById('theme-editor');
  if (!editor) return;
  editor.querySelectorAll('input, select, textarea').forEach(el => {
    el.disabled = readonly;
    el.style.opacity = readonly ? '0.55' : '';
    el.style.cursor = readonly ? 'not-allowed' : '';
  });
  const note = document.getElementById('theme-readonly-note');
  if (note) note.style.display = readonly ? 'block' : 'none';
}

function setupThemeTab() {
  document.getElementById('create-theme-btn')?.addEventListener('click', () => {
    const name = prompt('New theme name:');
    if (!name) return;

    // Ask which built-in theme to inherit
    const builtinNames = BUILTIN_THEMES.map(id => _config.themes[id]?.name || id);
    const pick = prompt(`Inherit from which base theme?\n${BUILTIN_THEMES.map((id, i) => `${i + 1}. ${builtinNames[i]}`).join('\n')}\n\nEnter number:`);
    const idx = parseInt(pick) - 1;
    const baseId = (idx >= 0 && idx < BUILTIN_THEMES.length) ? BUILTIN_THEMES[idx] : _config.currentTheme;
    const base = { ..._config.themes[baseId] };
    base.name = name;

    const id = 'custom-' + name.toLowerCase().replace(/\s+/g, '-');
    _config.themes[id] = base;
    _config.currentTheme = id;
    applyTheme(base);
    refreshThemeGrid();
    populateThemeEditor(base);
    setupColorSyncs();
    setEditorReadOnly(false);
  });

  // Theme editor live updates — blocked for built-ins
  document.getElementById('theme-editor')?.addEventListener('input', (e) => {
    if (isBuiltin(_config.currentTheme)) return; // read-only guard
    const id = e.target.id;
    if (!id.startsWith('te-')) return;
    const field = id.replace('te-', '').replace('-picker', '');
    const isPicker = id.endsWith('-picker');
    const val = e.target.value;
    const theme = _config.themes[_config.currentTheme];
    if (!theme) return;
    theme[field] = val;
    // sync paired control
    const paired = isPicker
      ? document.getElementById('te-' + field)
      : document.getElementById('te-' + field + '-picker');
    if (paired) paired.value = val;
  });
}

function setupColorSyncs() {
  const colorFields = ['pageBg','cardBg','textColor','accentColor','deepColor','btnBg','btnText','btnHoverBg','btnHoverText','footerBg','footerText'];
  colorFields.forEach(field => {
    const text = document.getElementById('te-' + field);
    const picker = document.getElementById('te-' + field + '-picker');
    if (text && picker) {
      text.addEventListener('input', () => { picker.value = text.value; });
      picker.addEventListener('input', () => { text.value = picker.value; });
    }
  });
}

function refreshThemeGrid() {
  buildThemeGrid(_config,
    (id) => {
      _config.currentTheme = id;
      applyTheme(_config.themes[id]);
      populateThemeEditor(_config.themes[id]);
      setupColorSyncs();
      setEditorReadOnly(isBuiltin(id));
      refreshThemeGrid();
      if (_rerender) _rerender();
    },
    (id) => {
      if (confirm('Delete theme "' + _config.themes[id].name + '"?')) {
        delete _config.themes[id];
        if (_config.currentTheme === id) {
          _config.currentTheme = 'editorial';
          applyTheme(_config.themes['editorial']);
        }
        refreshThemeGrid();
      }
    }
  );
}

function setupFolderTab(onFolderLoad) {
  const dropzone = document.getElementById('admin-folder-drop');
  const clearBtn = document.getElementById('admin-folder-clear');

  if (dropzone) {
    dropzone.addEventListener('click', async () => {
      try {
        const dirHandle = await window.showDirectoryPicker();
        if (onFolderLoad) onFolderLoad(dirHandle);
      } catch {}
    });
    dropzone.addEventListener('dragover', e => e.preventDefault());
    dropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      const item = e.dataTransfer.items[0];
      if (item?.kind === 'file') {
        const entry = item.getAsFileSystemHandle ? await item.getAsFileSystemHandle() : null;
        if (entry?.kind === 'directory' && onFolderLoad) onFolderLoad(entry);
      }
    });
  }

  clearBtn?.addEventListener('click', () => {
    _config.folderName = '';
    document.getElementById('admin-current-folder').textContent = 'None';
    document.getElementById('session-folder').textContent = 'None';
  });
}

function renderFieldsTab() {
  const container = document.getElementById('fields-list');
  if (!container) return;
  const vis = _config.fieldVis || {};
  const order = _config.fieldOrder || [];
  container.innerHTML = '';

  order.forEach(field => {
    const row = document.createElement('div');
    row.className = 'field-row';
    row.dataset.field = field;
    const isOn = vis[field] !== false;
    row.innerHTML = `
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <span class="field-label">${field}</span>
      <label class="toggle">
        <input type="checkbox" ${isOn ? 'checked' : ''} data-field="${field}">
        <span class="toggle-slider"></span>
      </label>`;
    row.querySelector('input').addEventListener('change', (e) => {
      _config.fieldVis[field] = e.target.checked;
      if (_rerender) _rerender();
    });
    container.appendChild(row);
  });

  // Simple drag-to-reorder
  let dragging = null;
  container.addEventListener('dragstart', e => {
    dragging = e.target.closest('.field-row');
    if (dragging) dragging.style.opacity = '0.4';
  });
  container.addEventListener('dragover', e => {
    e.preventDefault();
    const target = e.target.closest('.field-row');
    if (target && target !== dragging) {
      const rect = target.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      container.insertBefore(dragging, after ? target.nextSibling : target);
    }
  });
  container.addEventListener('dragend', () => {
    if (dragging) dragging.style.opacity = '';
    dragging = null;
    _config.fieldOrder = [...container.querySelectorAll('.field-row')].map(r => r.dataset.field);
    if (_rerender) _rerender();
  });
  container.querySelectorAll('.field-row').forEach(row => { row.draggable = true; });

  // Show desc toggle
  const descToggle = document.getElementById('admin-show-desc');
  if (descToggle) {
    descToggle.checked = _config.showDesc !== false;
    descToggle.addEventListener('change', () => {
      _config.showDesc = descToggle.checked;
      if (_rerender) _rerender();
    });
  }
}

export function updateFieldsTab(allFields, config) {
  // Merge newly discovered fields into config
  allFields.forEach(f => {
    if (!config.fieldOrder.includes(f)) config.fieldOrder.push(f);
    if (config.fieldVis[f] === undefined) config.fieldVis[f] = true;
  });
  renderFieldsTab();
  updateSessionInfo(config);
}

function setupFooterButtons() {
  document.getElementById('admin-preview-btn')?.addEventListener('click', () => {
    readAdminIntoConfig();
    applyTheme(_config.themes[_config.currentTheme]);
    if (_rerender) _rerender();
    showToast('Preview applied — not saved yet');
  });

  document.getElementById('admin-discard-btn')?.addEventListener('click', () => {
    if (_onDiscard) _onDiscard();
    populateAdmin();
    showToast('Changes discarded');
  });

  document.getElementById('admin-save-btn')?.addEventListener('click', () => {
    readAdminIntoConfig();
    const json = JSON.stringify(_config, (k, v) => k === '_loaded' ? undefined : v, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'settings.json';
    a.click();
    showToast('settings.json downloaded — replace file ✓');
  });
}

function readAdminIntoConfig() {
  _config.storeName = getVal('admin-store-name');
  _config.heroTitle = getVal('admin-hero-title');
  _config.heroSub = getVal('admin-hero-sub');

  // Theme editor
  const theme = _config.themes[_config.currentTheme];
  if (theme) {
    const updated = readThemeEditor(theme);
    _config.themes[_config.currentTheme] = updated;
  }

  // Contact
  ['email','phone','whatsapp','wechat','telegram','instagram','website'].forEach(f => {
    _config[f] = getVal('admin-' + f);
  });

  // Update display
  document.getElementById('store-name-display').textContent = _config.storeName;
  document.getElementById('hero-title-display').textContent = _config.heroTitle;
  document.getElementById('hero-sub-display').textContent = _config.heroSub;
}

export function updateSessionInfo(config) {
  const el = document.getElementById('admin-current-folder');
  if (el) el.textContent = config.folderName || 'None';
  const sf = document.getElementById('session-folder');
  if (sf) sf.textContent = config.folderName || 'None';
}

function updateSettingsIndicator(loaded) {
  const dot = document.getElementById('settings-indicator');
  if (!dot) return;
  dot.className = loaded ? 'indicator-green' : 'indicator-amber';
  dot.title = loaded ? 'settings.json loaded' : 'No settings.json — using defaults';
}

export function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('toast-show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('toast-show'), 3000);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}
