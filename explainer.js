// explainer.js — Explainer screen shown after folder scan

export function showExplainer(folderName, imageCount, txtCount, totalFiles, skipped, onView, onBack) {
  const overlay = document.getElementById('explainer-overlay');
  overlay.style.display = 'flex';

  document.getElementById('exp-folder-name').textContent = folderName;
  document.getElementById('exp-img-count').textContent = imageCount;
  document.getElementById('exp-txt-count').textContent = txtCount;
  document.getElementById('exp-total-count').textContent = totalFiles;
  document.getElementById('exp-skipped-count').textContent = skipped;

  const viewBtn = document.getElementById('exp-view-btn');
  viewBtn.textContent = `View my products (${imageCount})`;

  viewBtn.onclick = () => {
    overlay.style.display = 'none';
    onView();
  };
  document.getElementById('exp-back-btn').onclick = () => {
    overlay.style.display = 'none';
    onBack();
  };
}

export function hideExplainer() {
  const overlay = document.getElementById('explainer-overlay');
  if (overlay) overlay.style.display = 'none';
}
