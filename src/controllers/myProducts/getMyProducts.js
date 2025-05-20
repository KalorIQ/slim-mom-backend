import createHttpError from 'http-errors';
import { getProductsForDateService } from '../../services/user.js';

const getMyProducts = async (req, res) => {
  console.log('In getMyProducts controller');
  const { date } = req.query;
  console.log('In getMyProducts controller, date:', date);

  // Validate date format and existence
  if (!date) {
    throw createHttpError(400, 'Date is required!');
  }

  const parsedDate = Date.parse(date);
  if (isNaN(parsedDate)) {
    throw createHttpError(400, 'Invalid date format!');
  }

  console.log('In getMyProducts controller, date is valid');
  const owner = req.user._id;
  console.log('In getMyProducts controller, owner:', owner);

  const dateFormatted = new Date(parsedDate).toISOString().split('T')[0];
  console.log('In getMyProducts controller, dateFormatted:', dateFormatted);

  const products = await getProductsForDateService(owner, dateFormatted);
  console.log('In getMyProducts controller, products:', products);

  return res.status(200).json({
    message: products.length
      ? 'Successfully got products!'
      : 'No product found for this date!',
    products: products || [],
  });
};

export { getMyProducts };
