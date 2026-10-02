const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Default sample products to seed when database catalog is empty
 */
const DEFAULT_SAMPLE_PRODUCTS = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear wireless headphones with active noise cancellation and crystal clear audio fidelity.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Electronics',
    stock: 25,
  },
  {
    name: 'Classic White Sneakers',
    description: 'Breathable cushioned athletic running shoes with lightweight grip and ergonomic sole support.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Shoes',
    stock: 40,
  },
  {
    name: 'Minimalist Cotton T-Shirt',
    description: '100% organic combed cotton relaxed fit crewneck t-shirt with premium pre-shrunk stitching.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Fashion',
    stock: 50,
  },
  {
    name: 'Smart Fitness Watch Series 5',
    description: 'Full touch AMOLED display with continuous heart rate sensor, sleep tracking, and 7-day battery life.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Electronics',
    stock: 15,
  },
  {
    name: 'Trail Running Shoes Pro',
    description: 'High-traction outdoor trail runners designed for rugged terrains with shock absorption.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Shoes',
    stock: 5, // Low stock indicator
  },
  {
    name: 'Leather Crossbody Messenger Bag',
    description: 'Handcrafted full-grain leather everyday messenger bag with brass buckles and dedicated tablet sleeve.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Fashion',
    stock: 8,
  },
];

/**
 * Auto-seeds sample categories and products if collection is empty
 */
const autoSeedIfEmpty = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Catalog Seeder] Catalog empty, inserting demo categories and products...');
      const categoryMap = {};

      const categoriesList = ['Electronics', 'Fashion', 'Shoes'];
      for (const catName of categoriesList) {
        let cat = await Category.findOne({ name: catName });
        if (!cat) {
          cat = await Category.create({
            name: catName,
            description: `${catName} collection and accessories`,
          });
        }
        categoryMap[catName] = cat._id;
      }

      for (const prod of DEFAULT_SAMPLE_PRODUCTS) {
        await Product.create({
          name: prod.name,
          description: prod.description,
          price: prod.price,
          image: prod.image,
          category: categoryMap[prod.categoryName],
          stock: prod.stock,
        });
      }
      console.log('[Catalog Seeder] Successfully seeded demo catalog products');
    }
  } catch (err) {
    console.error(`[Catalog Seeder Error]: ${err.message}`);
  }
};

/**
 * @desc    Get all products (Filter by category, search query)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    await autoSeedIfEmpty();

    const { category, search } = req.query;
    let query = {};

    // Filter by category (by id or name)
    if (category && category !== 'all' && category !== 'All') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      if (isObjectId) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${category}$`, 'i') },
        });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // Filter by keyword search
    if (search && search.trim()) {
      const keywordRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: keywordRegex }, { description: keywordRegex }];
    }

    const products = await Product.find(query).populate('category', 'name').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product details
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private (Admin Only)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || !description || price === undefined || !image || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, image, category, stock',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image.trim(),
      category,
      stock: Number(stock),
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  autoSeedIfEmpty,
};
