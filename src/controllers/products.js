import Products from '../db/models/products.js';
import { errorHandler } from '../middlewares/errorHandler.js';

export async function getProductsByQuery(req, res, next) {
  try {
    const { title } = req.query;
    if (!title) {
      return next(errorHandler);
    }

    const regex = new RegExp(title, 'i');
    const data = await Products.find({ title: regex }).limit(10);

    res.status(200).json({
      message: 'Products matching your search',
      data: data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllProducts(req, res, next) {
  try {
    const allProducts = await Products.find();
    const products = allProducts.map((el) => {
      return {
        kcal: el.kcal,
        weight: el.weight,
        title: el.title,
        id: el._id,
      };
    });
    res.status(200).json({
      message: 'All products',
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function addProduct(req, res, next) {
  try {
    const { title, weight, kcal } = req.body;
    if (!title || !weight || !kcal) {
      return next(errorHandler);
    }

    const newProduct = await Products.create({ title, weight, kcal });
    res.status(201).json({
      message: 'Product added successfully',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
}
export async function removeProduct(req, res, next) {
  try {
    const { productId } = req.params;
    if (!productId) {
      return next(errorHandler);
    }

    const deletedProduct = await Products.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    res.status(200).json({
      message: 'Product removed successfully',
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
}
