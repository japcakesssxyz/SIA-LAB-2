const express = require('express');
const app = express();
const PORT = 5002;

const products = [
  {
    id: 1,
    name: 'Laptop Pro',
    price: 1299.99,
    category: 'Electronics',
    inStock: true
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    price: 29.99,
    category: 'Accessories',
    inStock: true
  },
  {
    id: 3,
    name: 'USB-C Cable',
    price: 19.99,
    category: 'Accessories',
    inStock: false
  },
  {
    id: 4,
    name: 'Monitor 27"',
    price: 349.99,
    category: 'Electronics',
    inStock: true
  },
  {
    id: 5,
    name: 'Keyboard Pro',
    price: 89.99,
    category: 'Accessories',
    inStock: true
  }
];

app.get(['/products', '/items'], (req, res) => {
  console.log('Product service: Returning', products.length, 'products');

  res.json({
    service: 'Product Service',
    status: 'success',
    count: products.length,
    data: products,
    timestamp: new Date().toISOString()
  });
});

app.get('/ping', (req, res) => {
  res.json({
    status: 'online',
    service: 'Product Service'
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(40));
  console.log('PRODUCT SERVICE STARTED');
  console.log('='.repeat(40));
  console.log(`Port: ${PORT}`);
  console.log(`GET /products - Returns ${products.length} products`);
  console.log('GET /ping - Health check');
  console.log('='.repeat(40));
});
