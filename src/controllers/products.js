import Product from '../db/models/products.js';
import { errorHandler } from '../middlewares/errorHandler.js';

export async function getProductsByQuery(req, res, next) {
  try {
    const { title } = req.query;
    if (!title) {
      return next(errorHandler);
    }

    const regex = new RegExp(title, 'i');
    const data = await Product.find({ title: regex }).limit(10);
    
    res.status(200).json({
      message: 'Products matching your search',
      data: data,
    });
  } catch (error) {
    next(error);
  }
}
