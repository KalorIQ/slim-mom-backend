import createHttpError from "http-errors";
import { getProductsForDateService } from "../../services/user.js";

const getWeeklyCalories = async (req, res) => {
  const owner = req.user._id;

  try {
    // Get last 7 days of data
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      try {
        const products = await getProductsForDateService(owner, dateString);
        
        let totalCalories = 0;
        if (products && products.length > 0) {
          totalCalories = products.reduce((acc, product) => {
            const productCalories = (product.productId.calories / 100) * product.productWeight;
            return acc + productCalories;
          }, 0);
        }

        weeklyData.push({
          date: dateString,
          calories: Math.round(totalCalories)
        });
      } catch (error) {
        // If error getting data for a specific date, add 0 calories
        weeklyData.push({
          date: dateString,
          calories: 0
        });
      }
    }

    // Frontend expects direct array, not wrapped in data object for this endpoint
    res.status(200).json(weeklyData);
  } catch (error) {
    throw createHttpError(500, "Failed to get weekly calories data");
  }
};

export { getWeeklyCalories }; 