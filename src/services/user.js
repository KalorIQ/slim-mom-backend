import { MyProducts } from '../db/models/MyProducts.model.js';
import Product from '../db/models/products.js';
import userCollection from '../db/models/user.js';

export const getNotAllowedFoodsService = async (bloodType) => {
  return await Product.distinct('categories', {
    [`groupBloodNotAllowed.${bloodType}`]: true,
  });
};

export const getProductsForDateService = async (owner, date) => {
  if (!date) {
    // Today
    date = new Date().toISOString().split('T')[0];
  }
  const products = await MyProducts.find({
    owner,
    date,
  }).populate({ path: 'productId', select: '-groupBloodNotAllowed -weight' });
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
