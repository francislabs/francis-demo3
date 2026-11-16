const config = require('./config');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPage(info) {
  const products = config.products
    .map(
      (p) => `
        <li class="card">
          <span class="name">${escapeHtml(p.name)}</span>
          <span class="price">$${Number(p.price).toFixed(2)}</span>
        </li>`
    )
    .join('');

  const promo = config.promoBanner
    ? `<div class="promo" data-testid="promo">${escapeHtml(config.promoBanner)}</div>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(config.appName)}</title>
  <style>
    :root { --accent: ${escapeHtml(config.themeColor)}; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #f4f6fa; color: #1b1f24; }
    header { background: var(--accent); color: #fff; padding: 48px 24px; text-align: center; }
    header h1 { margin: 0 0 8px; font-size: 2.2rem; }
    header p { margin: 0; opacity: .9; }
    .promo { background: #111; color: #ffd84d; text-align: center; padding: 12px; font-weight: 600; letter-spacing: .02em; }
    main { max-width: 760px; margin: 32px auto; padding: 0 16px; }
    ul { list-style: none; padding: 0; display: grid; gap: 12px; }
    .card { background: #fff; border-radius: 10px; padding: 18px 20px; display: flex; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .price { color: var(--accent); font-weight: 700; }
    footer { max-width: 760px; margin: 0 auto 32px; padding: 0 16px; font-size: .85rem; color: #5b6470; }
    code { background: #e6eaf0; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <header>
    <h1 data-testid="headline">${escapeHtml(config.headline)}</h1>
    <p>${escapeHtml(config.tagline)}</p>
  </header>
  ${promo}
  <main>
    <h2>Products</h2>
    <ul>${products}</ul>
  </main>
  <footer>
    Version <code data-testid="version">${escapeHtml(info.version)}</code>
    &middot; Commit <code>${escapeHtml(info.commit)}</code>
    &middot; Pod <code>${escapeHtml(info.hostname)}</code>
  </footer>
</body>
</html>`;
}

module.exports = { renderPage, escapeHtml };
