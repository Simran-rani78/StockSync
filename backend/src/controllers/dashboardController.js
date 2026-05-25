const { Op } = require('sequelize');
const { Product, Order, User } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total products SKU count
    const totalProducts = await Product.count();

    // 2. Orders placed today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const ordersToday = await Order.count({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    // 3. Total revenue from completed orders
    const completedOrders = await Order.findAll({
      where: { status: 'Completed' },
      attributes: ['totalPrice']
    });
    const revenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);

    // 4. Low stock products count (below 10 units)
    const lowStockProducts = await Product.count({
      where: {
        quantity: { [Op.lt]: 10 }
      }
    });

    // 5. Sales analytics time-series (past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
        status: { [Op.ne]: 'Cancelled' } // ignore cancelled order metrics
      },
      attributes: ['totalPrice', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });

    // Structure 7 days chronological map
    const analyticsMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      analyticsMap[dateStr] = { date: dateStr, sales: 0, orders: 0 };
    }

    recentOrders.forEach(order => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (analyticsMap[dateStr]) {
        analyticsMap[dateStr].sales += parseFloat(order.totalPrice);
        analyticsMap[dateStr].orders += 1;
      }
    });

    const salesAnalytics = Object.values(analyticsMap);

    // 6. Recent Orders list (top 5 for visual table widget)
    const recentOrdersList = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });

    // 7. Low Stock Alerts List (top 5 low stock products)
    const lowStockList = await Product.findAll({
      where: {
        quantity: { [Op.lt]: 10 }
      },
      limit: 5,
      order: [['quantity', 'ASC']],
      include: [
        {
          association: 'category',
          attributes: ['name']
        }
      ]
    });

    return res.status(200).json({
      stats: {
        totalProducts,
        ordersToday,
        revenue: parseFloat(revenue.toFixed(2)),
        lowStockProducts
      },
      salesAnalytics,
      recentOrders: recentOrdersList,
      lowStockList
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return res.status(500).json({ error: 'Server error generating dashboard data.' });
  }
};
