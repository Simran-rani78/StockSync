'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Seed Categories
    const categoryIds = {
      electronics: '11111111-1111-1111-1111-111111111111',
      bakery: '22222222-2222-2222-2222-222222222222',
      retail: '33333333-3333-3333-3333-333333333333'
    };

    await queryInterface.bulkInsert('Categories', [
      {
        id: categoryIds.electronics,
        name: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: categoryIds.bakery,
        name: 'Bakery',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: categoryIds.retail,
        name: 'Retail',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // 2. Seed Users (Hashed Passwords)
    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync('admin123', salt);
    const staffPassword = bcrypt.hashSync('staff123', salt);
    const customerPassword = bcrypt.hashSync('customer123', salt);

    const userIds = {
      admin: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      staff: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      customer: 'cccccccc-cccc-cccc-cccc-cccccccccccc'
    };

    await queryInterface.bulkInsert('Users', [
      {
        id: userIds.admin,
        name: 'StockSync Admin',
        email: 'admin@stocksync.com',
        password: adminPassword,
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: userIds.staff,
        name: 'StockSync Staff',
        email: 'staff@stocksync.com',
        password: staffPassword,
        role: 'Staff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: userIds.customer,
        name: 'StockSync Customer',
        email: 'customer@stocksync.com',
        password: customerPassword,
        role: 'Customer',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // 3. Seed Products
    await queryInterface.bulkInsert('Products', [
      // Electronics
      {
        id: 'e1111111-1111-1111-1111-111111111111',
        name: 'Smart Watch X-200',
        description: 'Advanced wearable tracker with continuous heart rate monitor and AMOLED display.',
        price: 199.99,
        quantity: 25, // Healthy stock
        sku: 'ELEC-SMART-X200',
        imageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=400',
        categoryId: categoryIds.electronics,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'e2222222-2222-2222-2222-222222222222',
        name: 'Pro Wireless Earbuds',
        description: 'Noise-cancelling bluetooth earbuds with ultra-long 30h battery life case.',
        price: 89.99,
        quantity: 5, // Low stock alert (threshold < 10)
        sku: 'ELEC-EARB-PRO',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400',
        categoryId: categoryIds.electronics,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Bakery
      {
        id: 'b1111111-1111-1111-1111-111111111111',
        name: 'Gourmet Chocolate Cake',
        description: 'Double chocolate fudge cake handcrafted by local master bakers.',
        price: 34.50,
        quantity: 15,
        sku: 'BAKE-CAKE-CHOC',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400',
        categoryId: categoryIds.bakery,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        name: 'Artisanal Sourdough Bread',
        description: 'Freshly baked daily organic flour rustic sourdough loaf.',
        price: 6.20,
        quantity: 4, // Low stock alert
        sku: 'BAKE-SOUR-BREAD',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
        categoryId: categoryIds.bakery,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Retail
      {
        id: 'c1111111-1111-1111-1111-111111111111',
        name: 'Premium Leather Jacket',
        description: 'High-grade lambskin leather jacket with slim fit styling.',
        price: 249.00,
        quantity: 12,
        sku: 'RET-JACK-LTHR',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
        categoryId: categoryIds.retail,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'c2222222-2222-2222-2222-222222222222',
        name: 'Adventure Canvas Backpack',
        description: 'Waterproof multi-compartment hiking and daily commute rucksack.',
        price: 75.00,
        quantity: 8, // Low stock alert
        sku: 'RET-BACK-ADVENT',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400',
        categoryId: categoryIds.retail,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
