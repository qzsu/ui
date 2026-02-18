// modal.js — Product detail modal

export function initModal() {
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

  // ── Box sizing ──────────────────────────────────────────
  // modalWidth controls max-width of the modal box
  box.style.maxWidth = theme.modalWidth || '860px';
  box.style.flexDirection = isTopDown ? 'column' : 'row';
  box.style.borderRadius = Math.max(0, (parseInt(theme.cardRadius) || 0) + 4) + 'px';

  // ── Overlay padding creates vertical centering for short modals;
  //    overlay itself scrolls for tall content
  const mh = theme.modalHeight || '90vh';
  const pad = `max(2rem, calc((100vh - ${mh}) / 2))`;
  overlay.style.paddingTop = pad;
  overlay.style.paddingBottom = pad;

  // ── Fields ───────────────────────────────────────────────
  const INTERNAL = ['_src', '_filename'];
  const STANDARD = ['title', 'price', 'description'];
  const allProductKeys = Object.keys(product).filter(k => !INTERNAL.includes(k));
  const customKeys = allProductKeys.filter(k => !STANDARD.includes(k));

  const title = product.title || product._filename || 'Product';
  const price = product.price || '';
  const desc  = product.description || '';

  // ── Image sizing ─────────────────────────────────────────
  // Side-by-side: modalImgWidth % of modal box width
  // Top-down:     modalImgHeight % of viewport height
  let imgWrapStyle, imgStyle;
  if (isTopDown) {
    const imgH = parseInt(theme.modalImgHeight) || 50;
    imgWrapStyle = `width:100%;height:${imgH}vh;flex-shrink:0;`;
    imgStyle     = 'width:100%;height:100%;object-fit:contain;display:block;';
  } else {
    const imgW = parseInt(theme.modalImgWidth) || 48;
    imgWrapStyle = `width:${imgW}%;flex-shrink:0;min-height:200px;`;
    imgStyle     = 'width:100%;height:100%;object-fit:contain;display:block;';
  }

  box.innerHTML = `
    <button class="modal-close" id="modal-close-btn" aria-label="Close">×</button>
    <div class="modal-img-wrap" style="${imgWrapStyle}background:color-mix(in srgb, var(--accent-color) 8%, var(--page-bg));">
      <img src="${product._src}" alt="${title}" style="${imgStyle}" />
    </div>
    <div class="modal-content" style="flex:1;min-width:0;padding:2rem;">
      <h2 style="font-family:var(--display-font);font-size:${theme.modalTitleSize || 1.75}rem;color:var(--deep-color);margin:0 0 0.5rem;line-height:1.2;padding-right:2rem">${title}</h2>
      ${price ? `<div style="font-size:1.15rem;font-weight:700;color:var(--accent-color);margin-bottom:1rem">${price}</div>` : ''}
      ${desc   ? `<p style="font-size:${theme.modalDescSize || 1}rem;line-height:1.75;color:var(--text-color);margin-bottom:1.5rem;white-space:pre-wrap">${desc}</p>` : ''}
      ${customKeys.length ? `<hr style="border:none;border-top:1px solid var(--accent-color);opacity:0.25;margin-bottom:1rem">` : ''}
      ${customKeys.filter(k => product[k]).map(k => `
        <div style="display:flex;gap:0.75rem;margin-bottom:0.6rem;font-size:0.9rem;align-items:flex-start;">
          <span style="color:var(--accent-color);font-weight:600;text-transform:capitalize;min-width:90px;flex-shrink:0;">${k}:</span>
          <span style="color:var(--text-color);white-space:pre-wrap;word-break:break-word;">${product[k]}</span>
        </div>`).join('')}
      <div style="margin-top:1.5rem;padding-top:0.75rem;border-top:1px solid color-mix(in srgb,var(--accent-color) 15%,transparent);font-size:0.72rem;color:var(--text-color);opacity:0.4;">${product._filename || ''}</div>
    </div>
  `;

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);

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
