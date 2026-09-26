'use strict';
// Client for the warehouse stock API. The base URL comes from STOCK_API_URL, e.g. https://stock.internal/api.

function baseUrl() {
  const url = process.env.STOCK_API_URL;
  if (!url) throw new Error('STOCK_API_URL is not set');
  return url.replace(/\/+$/, '');
}

// One item by SKU: { sku, name, qty }.
async function getItem(sku) {
  const res = await fetch(`${baseUrl()}/items/${encodeURIComponent(sku)}`);
  if (!res.ok) throw new Error(`stock API answered ${res.status} for ${sku}`);
  return res.json();
}

module.exports = { getItem };
