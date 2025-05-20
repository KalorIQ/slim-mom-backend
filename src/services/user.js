import { MyProducts } from '../db/models/MyProducts.model.js';
import Product from '../db/models/products.js';

export const getNotAllowedFoodsService = async (bloodType) => {
  return await Product.distinct('categories', {
    [`groupBloodNotAllowed.${bloodType}`]: true,
  });
};

export const getProductsForDateService = async (owner, date) => {
  console.log('In getProductsForDateService, owner:', owner);
  console.log('In getProductsForDateService, date:', date);
  if (!date) {
    // Today
    date = new Date().toISOString().split('T')[0];
    console.log('In getProductsForDateService, date:', date);
  }
  const products = await MyProducts.find({
    owner,
    date,
  }).populate({ path: 'productId', select: '-groupBloodNotAllowed -weight' });
  console.log('In getProductsForDateService, products:', products);

  return products;
};
