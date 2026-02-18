// product_display.js — Grid and list rendering + pagination

import { openModal } from './modal.js';

let _products = [];
let _config = {};
let _currentPage = 1;
let _viewMode = 'grid'; // 'grid' | 'list'

export function initDisplay(products, config) {
  _products = products;
  _config = config;
  _currentPage = 1;
  render();
}

export function setViewMode(mode) {
  _viewMode = mode;
  render();
}

export function setPage(p) {
  _currentPage = p;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function render() {
  const theme = _config.themes[_config.currentTheme] || {};
  const ipp = theme.itemsPerPage === 'All' ? _products.length : (parseInt(theme.itemsPerPage) || 12);
  const totalPages = Math.ceil(_products.length / ipp);
  _currentPage = Math.min(_currentPage, Math.max(1, totalPages));

  const start = (_currentPage - 1) * ipp;
  const slice = _products.slice(start, start + ipp);

  renderGrid(slice, theme);
  renderPagination(totalPages, theme);
}

function getVisibleFields(config) {
  const vis = config.fieldVis || {};
  const order = config.fieldOrder || [];
  return order.filter(f => vis[f] !== false);
}

function renderGrid(products, theme) {
  const container = document.getElementById('product-grid');
  if (!container) return;

  const isList = _viewMode === 'list';
  container.className = isList ? 'product-list' : 'product-grid';

  if (!products.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🗂️</div>
      <p>No products to display.</p>
      <p style="font-size:0.85rem;opacity:0.6">Drop a folder to get started.</p>
    </div>`;
    return;
  }

  const visFields = getVisibleFields(_config);
  container.innerHTML = '';

  products.forEach((product, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = (i * 0.04) + 's';

    const title = product.title || product._filename || 'Untitled';
    const price = product.price || '';
    const desc = _config.showDesc !== false ? (product.description || '') : '';

    const extraKeys = visFields.filter(f => !['title','price','description'].includes(f) && product[f]);
    const extraHTML = extraKeys.slice(0, 4).map(k => `
      <div class="card-extra-field">
        <span class="field-key">${k}:</span>
        <span class="field-val">${product[k]}</span>
      </div>`).join('');

    if (isList) {
      card.innerHTML = `
        <div class="card-list-img">
          <img src="${product._src}" alt="${title}" loading="lazy" />
        </div>
        <div class="card-list-body">
          <h3 class="card-title">${title}</h3>
          ${price ? `<div class="card-price">${price}</div>` : ''}
          ${desc ? `<p class="card-desc">${desc}</p>` : ''}
          ${extraHTML}
        </div>`;
    } else {
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${product._src}" alt="${title}" loading="lazy" />
        </div>
        <div class="card-body">
          <h3 class="card-title">${title}</h3>
          ${price ? `<div class="card-price">${price}</div>` : ''}
          ${desc ? `<p class="card-desc">${desc}</p>` : ''}
          ${extraHTML}
        </div>`;
    }

    card.addEventListener('click', () => openModal(product, _config.themes[_config.currentTheme] || {}));
    container.appendChild(card);
  });
}

function renderPagination(totalPages, theme) {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  pag.innerHTML = '';
  if (totalPages <= 1) return;

  const addBtn = (label, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'page-btn' + (active ? ' page-btn--active' : '');
    btn.disabled = disabled;
    btn.addEventListener('click', () => setPage(page));
    pag.appendChild(btn);
  };

  addBtn('←', _currentPage - 1, _currentPage === 1);

  const range = getPageRange(_currentPage, totalPages);
  let prev = null;
  range.forEach(p => {
    if (prev !== null && p - prev > 1) {
      const dots = document.createElement('span');
      dots.className = 'page-dots';
      dots.textContent = '…';
      pag.appendChild(dots);
    }
    addBtn(p, p, false, p === _currentPage);
    prev = p;
  });

  addBtn('→', _currentPage + 1, _currentPage === totalPages);
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i > 0 && i <= total) pages.add(i);
  }
  return [...pages].sort((a, b) => a - b);
}
