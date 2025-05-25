import createHttpError from "http-errors";
import { getProductsForDateService } from "../../services/user.js";

const getUserActivityStats = async (req, res) => {
  const owner = req.user._id;

  try {
    // Get last 30 days of activity data
    const today = new Date();
    const activityData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
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

        activityData.push({
          date: dateString,
          entriesCount: products ? products.length : 0,
          totalCalories: Math.round(totalCalories),
          hasActivity: products && products.length > 0
        });
      } catch (error) {
        activityData.push({
          date: dateString,
          entriesCount: 0,
          totalCalories: 0,
          hasActivity: false
        });
      }
    }

    // Calculate activity statistics
    const activeDays = activityData.filter(day => day.hasActivity).length;
    const totalEntries = activityData.reduce((sum, day) => sum + day.entriesCount, 0);
    const averageEntriesPerDay = activeDays > 0 ? Math.round(totalEntries / activeDays) : 0;
    const averageCaloriesPerDay = activeDays > 0 ? Math.round(
      activityData.reduce((sum, day) => sum + day.totalCalories, 0) / activeDays
    ) : 0;

    // Calculate current streak
    let currentStreak = 0;
    for (let i = activityData.length - 1; i >= 0; i--) {
      if (activityData[i].hasActivity) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const day of activityData) {
      if (day.hasActivity) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    const stats = {
      activeDays,
      totalEntries,
      averageEntriesPerDay,
      averageCaloriesPerDay,
      currentStreak,
      longestStreak,
      activityData: activityData.slice(-7) // Return last 7 days for chart
    };

    res.status(200).json({
      message: "User activity statistics retrieved successfully!",
      data: stats,
    });
  } catch (error) {
    throw createHttpError(500, "Failed to get user activity statistics");
  }
};

export { getUserActivityStats }; 