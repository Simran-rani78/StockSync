const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// Get categories list
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Server error fetching categories.' });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists.' });
    }

    const newCategory = await Category.create({ name });
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Server error creating category.' });
  }
};

// Update category (rename)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const existingCategory = await Category.findOne({ where: { name, id: { [Op.ne]: id } } });
    if (existingCategory) {
      return res.status(409).json({ error: 'Category name already in use.' });
    }

    await category.update({ name });
    return res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ error: 'Server error updating category.' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    // Check if any products are associated with this category
    const associatedProduct = await Product.findOne({ where: { categoryId: id } });
    if (associatedProduct) {
      return res.status(409).json({ error: 'Cannot delete category containing active products.' });
    }

    await category.destroy();
    return res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ error: 'Server error deleting category.' });
  }
};


// Get all products with filtering options
exports.getProducts = async (req, res) => {
  try {
    const { search, categoryId, lowStock } = req.query;
    const whereClause = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (lowStock === 'true') {
      whereClause.quantity = {
        [Op.lt]: 10 // Restock threshold (< 10 units)
      };
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Server error fetching products.' });
  }
};

// Add product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, sku, categoryId } = req.body;

    if (!name || price === undefined || quantity === undefined || !sku || !categoryId) {
      return res.status(400).json({ error: 'Name, price, quantity, SKU, and category are required.' });
    }

    const existingSku = await Product.findOne({ where: { sku } });
    if (existingSku) {
      return res.status(409).json({ error: 'SKU already exists.' });
    }

    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid Category selected.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.location || `/uploads/${req.file.filename}`;
    }

    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      sku,
      categoryId,
      imageUrl
    });

    const createdProduct = await Product.findByPk(newProduct.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    return res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ error: 'Server error adding product.' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, sku, categoryId } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Role safety validation: Staff is strictly restricted to modifying stock counts
    const isAdmin = req.user.role === 'Admin';
    if (!isAdmin) {
      if (name || description !== undefined || price !== undefined || sku || categoryId || req.file) {
        return res.status(403).json({ error: 'Access denied. Staff is only permitted to adjust stock quantity counts.' });
      }
    }

    if (sku && sku !== product.sku) {
      const existingSku = await Product.findOne({ where: { sku } });
      if (existingSku) {
        return res.status(409).json({ error: 'SKU code already in use.' });
      }
    }

    if (categoryId) {
      const categoryExists = await Category.findByPk(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ error: 'Invalid Category selected.' });
      }
    }

    const updateData = {
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      quantity: quantity !== undefined ? parseInt(quantity, 10) : product.quantity,
      sku: sku || product.sku,
      categoryId: categoryId || product.categoryId
    };

    if (req.file) {
      updateData.imageUrl = req.file.location || `/uploads/${req.file.filename}`;
    }

    await product.update(updateData);

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Server error updating product.' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await product.destroy();
    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        error: 'Cannot delete product as it is referenced in past customer orders. Set quantity to 0 instead.'
      });
    }
    return res.status(500).json({ error: 'Server error deleting product.' });
  }
};
