import createHttpError from 'http-errors';
import { getProductsForDateService } from '../../services/user.js';

const getMyProducts = async (req, res) => {
  const { date } = req.query;
  if (!date) {
    throw createHttpError(400, 'Date is required!');
  }
  const parsedDate = Date.parse(date);
  if (isNaN(parsedDate)) {
    throw createHttpError(400, 'Invalid date format!');
  }
  const owner = req.user._id;
  const dateFormatted = new Date(parsedDate).toISOString().split('T')[0];
  const products = await getProductsForDateService(owner, dateFormatted);
  return res.status(200).json({
    message: products.length
      ? 'Successfully got products!'
      : 'No product found for this date!',
    products: products || [],
  });
};

export { getMyProducts };
