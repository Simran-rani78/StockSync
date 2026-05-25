const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Categories routing (anyone can fetch, Admins can manage)
router.get('/categories', productController.getCategories);
router.post('/categories', authenticateToken, requireRole('Admin'), productController.createCategory);
router.put('/categories/:id', authenticateToken, requireRole('Admin'), productController.updateCategory);
router.delete('/categories/:id', authenticateToken, requireRole('Admin'), productController.deleteCategory);

// Product CRUD routing (anyone can read/list, only Admins can write)
router.get('/', productController.getProducts);
router.post('/', authenticateToken, requireRole('Admin'), upload.single('image'), productController.addProduct);
router.put('/:id', authenticateToken, requireRole(['Admin', 'Staff']), upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticateToken, requireRole('Admin'), productController.deleteProduct);

module.exports = router;
