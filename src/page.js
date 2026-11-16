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
          <div>
            <span class="name">${escapeHtml(p.name)}</span>
            <span class="price">$${Number(p.price).toFixed(2)}</span>
          </div>
          <button class="add" data-testid="add-${escapeHtml(p.id)}" data-product="${escapeHtml(p.id)}">Add to cart</button>
        </li>`
    )
    .join('');

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
    header { background: var(--accent); color: #fff; padding: 40px 24px; text-align: center; position: relative; }
    header h1 { margin: 0 0 8px; font-size: 2.2rem; }
    header p { margin: 0; opacity: .9; }
    .cart { position: absolute; top: 16px; right: 20px; background: rgba(255,255,255,.18); padding: 6px 12px; border-radius: 999px; font-weight: 600; }
    main { max-width: 760px; margin: 32px auto; padding: 0 16px; }
    ul { list-style: none; padding: 0; display: grid; gap: 12px; }
    .card { background: #fff; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .card .name { display: block; font-weight: 500; }
    .price { color: var(--accent); font-weight: 700; }
    .add { background: var(--accent); color: #fff; border: 0; border-radius: 8px; padding: 10px 16px; font-weight: 600; cursor: pointer; }
    .add:disabled { opacity: .6; cursor: progress; }
    .toast { max-width: 760px; margin: 0 auto 16px; padding: 12px 16px; border-radius: 8px; display: none; }
    .toast.ok { display: block; background: #e7f6ee; color: #0b5d39; }
    .toast.err { display: block; background: #fdecec; color: #9b1c1c; }
    footer { max-width: 760px; margin: 0 auto 32px; padding: 0 16px; font-size: .85rem; color: #5b6470; }
    code { background: #e6eaf0; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <header>
    <span class="cart" data-testid="cart-count">Cart: 0</span>
    <h1 data-testid="headline">${escapeHtml(config.headline)}</h1>
    <p>${escapeHtml(config.tagline)}</p>
  </header>
  <main>
    <h2>Products</h2>
    <ul>${products}</ul>
  </main>
  <div class="toast" id="toast" data-testid="toast" role="status"></div>
  <footer>
    Version <code data-testid="version">${escapeHtml(info.version)}</code>
    &middot; Commit <code>${escapeHtml(info.commit)}</code>
    &middot; Pod <code>${escapeHtml(info.hostname)}</code>
  </footer>
  <script>
    const toast = document.getElementById('toast');
    const count = document.querySelector('[data-testid="cart-count"]');
    function show(kind, text) { toast.className = 'toast ' + kind; toast.textContent = text; }
    document.querySelectorAll('.add').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: btn.dataset.product, quantity: 1 }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            show('err', 'Something went wrong adding this item to your cart.' + (data.incident ? ' Incident ' + data.incident + ' has been raised.' : ''));
          } else {
            count.textContent = 'Cart: ' + data.count;
            show('ok', 'Added to cart. Total $' + Number(data.total).toFixed(2));
          }
        } catch (e) {
          show('err', 'Something went wrong adding this item to your cart.');
        } finally {
          btn.disabled = false;
        }
      });
    });
  </script>
</body>
</html>`;
}

module.exports = { renderPage, escapeHtml };
