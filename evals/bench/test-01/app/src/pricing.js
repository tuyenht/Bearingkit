'use strict';
// Order pricing. Written in 2019 for the first shop, extended since; finance reconciles against these exact cents.
// Amounts are integer cents.

const TAX_RATES = { VN: 0.1, SG: 0.09, US: 0 };
const DEFAULT_TAX_RATE = 0.1;
const FREE_SHIPPING_FROM = 20000;

function lineTotal(item) {
  if (item.qty <= 0) return 0;
  let total = item.unitCents * item.qty;
  // Bulk price for more than a hundred units of one item.
  if (item.qty > 100) total = Math.round(total * 0.9);
  return total;
}

function discountFor(coupon, subtotal) {
  if (coupon === 'WELCOME10' && subtotal >= 5000) return Math.floor(subtotal * 0.1);
  if (coupon === 'FLAT500') return Math.min(500, subtotal);
  return 0;
}

function shippingFor(country, amount) {
  if (amount >= FREE_SHIPPING_FROM) return 0;
  return country === 'VN' ? 3000 : 5000;
}

function orderTotal(order) {
  const subtotal = order.items.reduce((sum, item) => sum + lineTotal(item), 0);
  const discount = discountFor(order.coupon, subtotal);
  const taxable = subtotal - discount;
  const rate = TAX_RATES[order.country] ?? DEFAULT_TAX_RATE;
  const tax = Math.round(taxable * rate);
  const shipping = shippingFor(order.country, taxable);
  return { subtotal, discount, tax, shipping, total: taxable + tax + shipping };
}

module.exports = { lineTotal, discountFor, shippingFor, orderTotal };
