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

  // Apply modal width as max-width on the box (honours px or % values from settings)
  const mw = theme.modalWidth || '860px';
  box.style.maxWidth = mw;
  box.style.flexDirection = isTopDown ? 'column' : 'row';
  box.style.borderRadius = (parseInt(theme.cardRadius) + 4) + 'px';

  // Apply modalHeight as a min-height hint on the overlay padding so short modals still feel intentional
  // (actual scroll is on overlay — no hard height cap on the box)
  const mh = theme.modalHeight || '90vh';
  overlay.style.paddingTop = `calc((100vh - ${mh}) / 2)`;
  overlay.style.paddingBottom = `calc((100vh - ${mh}) / 2)`;

  // ALL product fields, excluding internals
  const standardOrder = ['title', 'price', 'description'];
  const allKeys = Object.keys(product).filter(k => k !== '_filename' && k !== '_src');
  const custom = allKeys.filter(k => !standardOrder.includes(k));
  const ordered = [...standardOrder.filter(k => allKeys.includes(k)), ...custom];

  const title = product.title || product._filename || 'Product';
  const price = product.price || '';
  const desc = product.description || '';
  const extraFields = ordered.filter(k => !['title', 'price', 'description'].includes(k));

  // modalImgWidth % is relative to the modal box itself
  const imgPct = parseInt(theme.modalImgWidth) || 48;
  const imgStyle = isTopDown
    ? 'width:100%;'
    : `width:${imgPct}%;flex-shrink:0;`;

  box.innerHTML = `
    <button class="modal-close" id="modal-close-btn">×</button>
    <div class="modal-img-wrap" style="${imgStyle}background:color-mix(in srgb, var(--accent-color) 8%, var(--page-bg));">
      <img src="${product._src}" alt="${title}" style="width:100%;height:100%;object-fit:contain;display:block;min-height:200px;" />
    </div>
    <div class="modal-content" style="flex:1;min-width:0;padding:2rem 2rem 2rem 2rem;">
      <h2 style="font-family:var(--display-font);font-size:${theme.modalTitleSize}rem;color:var(--deep-color);margin:0 0 0.5rem;line-height:1.2">${title}</h2>
      ${price ? `<div style="font-size:1.2rem;font-weight:700;color:var(--accent-color);margin-bottom:1rem">${price}</div>` : ''}
      ${desc ? `<p style="font-size:${theme.modalDescSize}rem;line-height:1.7;color:var(--text-color);margin-bottom:1.5rem;white-space:pre-wrap">${desc}</p>` : ''}
      ${extraFields.length ? `<hr style="border:none;border-top:1px solid var(--accent-color);opacity:0.25;margin-bottom:1rem">` : ''}
      ${extraFields.map(k => `
        <div style="display:flex;gap:0.75rem;margin-bottom:0.6rem;font-size:0.9rem;align-items:flex-start;">
          <span style="color:var(--accent-color);font-weight:600;text-transform:capitalize;min-width:90px;flex-shrink:0;">${k}:</span>
          <span style="color:var(--text-color);white-space:pre-wrap;word-break:break-word">${product[k]}</span>
        </div>`).join('')}
      <div style="margin-top:1.5rem;padding-top:0.75rem;border-top:1px solid color-mix(in srgb,var(--accent-color) 15%,transparent);font-size:0.72rem;color:var(--text-color);opacity:0.4">${product._filename || ''}</div>
    </div>
  `;

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);

  // Reset overlay scroll position, lock body scroll
  overlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  overlay.classList.add('modal-visible');
  requestAnimationFrame(() => box.classList.add('modal-box--open'));
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.classList.remove('modal-box--open');
  setTimeout(() => {
    overlay.classList.remove('modal-visible');
    overlay.style.paddingTop = '';
    overlay.style.paddingBottom = '';
    document.body.style.overflow = '';
  }, 250);
}
