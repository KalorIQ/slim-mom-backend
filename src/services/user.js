import { MyProducts } from '../db/models/MyProducts.model.js';
import Product from '../db/models/products.js';
import userCollection from '../db/models/user.js';

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

export const updateInfouserService = async (
  userId,
  currentWeight,
  height,
  age,
  desireWeight,
  bloodType,
) => {
  const updatedUser = await userCollection.findByIdAndUpdate(
    userId,
    {
      'infouser.currentWeight': currentWeight,
      'infouser.height': height,
      'infouser.age': age,
      'infouser.desireWeight': desireWeight,
      'infouser.bloodType': bloodType,
    },
    { new: true }, // new: true, yeni güncellenen veriyi döndürür.
  );
  return updatedUser;
};
