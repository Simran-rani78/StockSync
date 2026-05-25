const { Order, OrderItem, Product, User, sequelize } = require('../models');

exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { items } = req.body; // Array: [{ productId, quantity }]
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    let totalPrice = 0;
    const itemsToCreate = [];

    // Loop through items to check stock & calculate price
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Invalid product details or quantity.' });
      }

      // Fetch product with lock
      const product = await Product.findByPk(productId, { transaction, lock: true });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product not found.` });
      }

      if (product.quantity < quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${quantity}.`
        });
      }

      const itemTotalPrice = parseFloat(product.price) * quantity;
      totalPrice += itemTotalPrice;

      // Update product quantity
      await product.update({ quantity: product.quantity - quantity }, { transaction });

      itemsToCreate.push({
        productId,
        quantity,
        price: product.price
      });
    }

    // Create Order
    const order = await Order.create({
      userId,
      totalPrice,
      status: 'Pending'
    }, { transaction });

    // Prepare items with order association
    const orderItems = itemsToCreate.map(item => ({
      ...item,
      orderId: order.id
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    await transaction.commit();

    // Fetch complete order payload to return
    const completedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'imageUrl'] }]
        }
      ]
    });

    return res.status(201).json(completedOrder);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Server error processing order.' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role === 'Customer') {
      whereClause.userId = req.user.id;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'imageUrl', 'price'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Server error fetching orders.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found.' });
    }

    // If cancelling an order, restore product quantity
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findByPk(item.productId, { transaction, lock: true });
        if (product) {
          await product.update({ quantity: product.quantity + item.quantity }, { transaction });
        }
      }
    }

    // If reopening a cancelled order, check stock and deduct again
    if (order.status === 'Cancelled' && status !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findByPk(item.productId, { transaction, lock: true });
        if (!product || product.quantity < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Cannot restore order. Product "${product ? product.name : 'Unknown'}" is out of stock.`
          });
        }
        await product.update({ quantity: product.quantity - item.quantity }, { transaction });
      }
    }

    await order.update({ status }, { transaction });
    await transaction.commit();

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'imageUrl'] }]
        }
      ]
    });

    return res.status(200).json(updatedOrder);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Server error updating order status.' });
  }
};
