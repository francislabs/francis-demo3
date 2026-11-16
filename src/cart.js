const config = require('./config');

// In-memory cart per pod. Good enough for a demo shop.
const items = [];

function findProduct(productId) {
  return config.products.find((p) => p.sku === productId);
}

function addToCart(productId, quantity = 1) {
  const product = findProduct(productId);
  const line = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
  };
  items.push(line);
  return summary();
}

function summary() {
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items, count, total };
}

function clear() {
  items.length = 0;
}

module.exports = { addToCart, summary, clear, findProduct };
