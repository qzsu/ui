// theme.js — Theme system management

export function applyTheme(theme) {
  const r = document.documentElement.style;
  r.setProperty('--page-bg', theme.pageBg);
  r.setProperty('--card-bg', theme.cardBg);
  r.setProperty('--text-color', theme.textColor);
  r.setProperty('--accent-color', theme.accentColor);
  r.setProperty('--deep-color', theme.deepColor);
  r.setProperty('--btn-bg', theme.btnBg);
  r.setProperty('--btn-text', theme.btnText);
  r.setProperty('--btn-hover-bg', theme.btnHoverBg);
  r.setProperty('--btn-hover-text', theme.btnHoverText);
  r.setProperty('--footer-bg', theme.footerBg);
  r.setProperty('--footer-text', theme.footerText);
  r.setProperty('--display-font', theme.displayFont);
  r.setProperty('--body-font', theme.bodyFont);
  r.setProperty('--title-size', theme.titleSize + 'rem');
  r.setProperty('--desc-size', theme.descSize + 'rem');
  r.setProperty('--desc-clamp', theme.descClamp);
  r.setProperty('--columns', theme.columns);
  r.setProperty('--gap', theme.gap + 'rem');
  r.setProperty('--card-radius', theme.cardRadius + 'px');
  r.setProperty('--aspect-ratio', theme.aspectRatio);
  r.setProperty('--footer-font-size', theme.footerFontSize + 'rem');
}

export function buildThemeGrid(config, onSwitch, onDelete) {
  const container = document.getElementById('theme-grid');
  if (!container) return;
  container.innerHTML = '';
  const themes = config.themes || {};
  Object.entries(themes).forEach(([id, theme]) => {
    const active = id === config.currentTheme;
    const isBuiltin = id === 'editorial' || id === 'brutalist';
    const card = document.createElement('div');
    card.className = 'theme-card' + (active ? ' theme-card--active' : '');
    card.innerHTML = `
      <div class="theme-swatches">
        <span style="background:${theme.pageBg}"></span>
        <span style="background:${theme.cardBg}"></span>
        <span style="background:${theme.accentColor}"></span>
        <span style="background:${theme.deepColor}"></span>
      </div>
      <div class="theme-info">
        <strong>${theme.name}</strong>
        <small>${theme.columns} col · ${theme.itemsPerPage}/page</small>
      </div>
      ${active ? '<div class="theme-active-badge">✓</div>' : ''}
      ${!isBuiltin ? `<button class="theme-delete" data-id="${id}" title="Delete theme">×</button>` : ''}
    `;
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('theme-delete')) return;
      onSwitch(id);
    });
    const del = card.querySelector('.theme-delete');
    if (del) del.addEventListener('click', (e) => { e.stopPropagation(); onDelete(id); });
    container.appendChild(card);
  });
}

export function populateThemeEditor(theme) {
  const fields = [
    'pageBg','cardBg','textColor','accentColor','deepColor',
    'btnBg','btnText','btnHoverBg','btnHoverText',
    'footerBg','footerText',
    'displayFont','bodyFont',
    'titleSize','descSize','descClamp',
    'columns','gap','itemsPerPage','cardRadius','aspectRatio',
    'modalStyle','modalWidth','modalHeight','modalTitleSize','modalDescSize','modalImgWidth',
    'footerFontSize','footerTagline','name'
  ];
  fields.forEach(field => {
    const el = document.getElementById('te-' + field);
    if (!el) return;
    el.value = theme[field] ?? '';
    // sync color pickers
    const picker = document.getElementById('te-' + field + '-picker');
    if (picker) picker.value = theme[field] ?? '#000000';
  });
}

export function readThemeEditor(theme) {
  const fields = [
    'pageBg','cardBg','textColor','accentColor','deepColor',
    'btnBg','btnText','btnHoverBg','btnHoverText',
    'footerBg','footerText',
    'displayFont','bodyFont',
    'titleSize','descSize','descClamp',
    'columns','gap','itemsPerPage','cardRadius','aspectRatio',
    'modalStyle','modalWidth','modalHeight','modalTitleSize','modalDescSize','modalImgWidth',
    'footerFontSize','footerTagline','name'
  ];
  const out = { ...theme };
  fields.forEach(field => {
    const el = document.getElementById('te-' + field);
    if (el) out[field] = el.value;
  });
  return out;
}
