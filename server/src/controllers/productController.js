import { Product } from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getProducts(req, res, next) {
  try {
    const { category, search, sort, isBestSeller, inStock } = req.query;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (isBestSeller === 'true') {
      filter.isBestSeller = true;
    }

    if (inStock === 'true') {
      filter.inStock = true;
    }

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tagline: searchRegex },
        { scent: searchRegex },
      ];
    }

    let sortOption = { order: 1, isBestSeller: -1, _id: 1 };
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1, reviewCount: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }

    const products = await Product.find(filter).sort(sortOption);
    return sendSuccess(res, products);
  } catch (error) {
    return next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 404, 'Product not found', 'NOT_FOUND');
    }
    return sendSuccess(res, product);
  } catch (error) {
    return next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    return sendSuccess(res, product, 201, 'Product created successfully');
  } catch (error) {
    return next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return sendError(res, 404, 'Product not found', 'NOT_FOUND');
    }
    return sendSuccess(res, product, 200, 'Product updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return sendError(res, 404, 'Product not found', 'NOT_FOUND');
    }
    return sendSuccess(res, product, 200, 'Product deleted successfully');
  } catch (error) {
    return next(error);
  }
}
