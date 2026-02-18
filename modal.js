// modal.js — Product detail modal

let currentTheme = null;

export function initModal(getThemeFn) {
  currentTheme = getThemeFn;
  const overlay = document.getElementById('modal-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

export function openModal(product, theme) {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  const isTopDown = theme.modalStyle === 'top-down';

  box.style.width = theme.modalWidth;
  box.style.maxHeight = theme.modalHeight;
  box.style.flexDirection = isTopDown ? 'column' : 'row';
  box.style.borderRadius = (parseInt(theme.cardRadius) + 4) + 'px';

  // Standard fields order
  const standardOrder = ['title', 'price', 'description'];
  const allKeys = Object.keys(product).filter(k => k !== '_filename' && k !== '_src');
  const custom = allKeys.filter(k => !standardOrder.includes(k));
  const ordered = [...standardOrder.filter(k => allKeys.includes(k)), ...custom];

  const title = product.title || product._filename || 'Product';
  const price = product.price || '';
  const desc = product.description || '';

  const extraFields = ordered.filter(k => !['title','price','description'].includes(k));

  box.innerHTML = `
    <button class="modal-close" id="modal-close-btn">×</button>
    <div class="modal-img-wrap" style="${isTopDown ? 'width:100%' : `width:${theme.modalImgWidth}%;flex-shrink:0`}">
      <img src="${product._src}" alt="${title}" style="width:100%;height:100%;object-fit:contain;display:block;" />
    </div>
    <div class="modal-content" style="flex:1;overflow-y:auto;padding:2rem;">
      <h2 style="font-family:var(--display-font);font-size:${theme.modalTitleSize}rem;color:var(--deep-color);margin:0 0 0.5rem">${title}</h2>
      ${price ? `<div style="font-size:1.2rem;font-weight:700;color:var(--accent-color);margin-bottom:1rem">${price}</div>` : ''}
      ${desc ? `<p style="font-size:${theme.modalDescSize}rem;line-height:1.7;color:var(--text-color);margin-bottom:1.5rem">${desc}</p>` : ''}
      ${extraFields.length ? `<hr style="border:none;border-top:1px solid var(--accent-color);opacity:0.3;margin-bottom:1rem">` : ''}
      ${extraFields.map(k => `
        <div style="display:flex;gap:0.75rem;margin-bottom:0.5rem;font-size:0.9rem;">
          <span style="color:var(--accent-color);font-weight:600;text-transform:capitalize;min-width:90px">${k}:</span>
          <span style="color:var(--text-color)">${product[k]}</span>
        </div>`).join('')}
      <div style="margin-top:1.5rem;font-size:0.75rem;color:var(--text-color);opacity:0.4">${product._filename || ''}</div>
    </div>
  `;

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);

  overlay.classList.add('modal-visible');
  requestAnimationFrame(() => box.classList.add('modal-box--open'));
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.classList.remove('modal-box--open');
  setTimeout(() => overlay.classList.remove('modal-visible'), 250);
}
