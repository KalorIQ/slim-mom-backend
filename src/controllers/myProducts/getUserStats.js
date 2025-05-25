import createHttpError from "http-errors";
import { getProductsForDateService } from "../../services/user.js";

const getUserStats = async (req, res) => {
  const owner = req.user._id;
  const user = req.user;

  try {
    // Get last 30 days of data to calculate streak and other stats
    const today = new Date();
    const daysData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      try {
        const products = await getProductsForDateService(owner, dateString);
        daysData.push({
          date: dateString,
          hasEntries: products && products.length > 0,
          entriesCount: products ? products.length : 0
        });
      } catch (error) {
        daysData.push({
          date: dateString,
          hasEntries: false,
          entriesCount: 0
        });
      }
    }

    // Calculate streak (consecutive days with entries from today backwards)
    let streak = 0;
    for (const dayData of daysData) {
      if (dayData.hasEntries) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate other stats
    const daysActive = daysData.filter(day => day.hasEntries).length;
    const totalEntries = daysData.reduce((sum, day) => sum + day.entriesCount, 0);
    
    // Calculate BMI
    const height = user.infouser?.height;
    const currentWeight = user.infouser?.currentWeight;
    let bmi = 24.1; // default
    if (height && currentWeight) {
      const heightInM = height / 100;
      bmi = currentWeight / (heightInM * heightInM);
    }

    // Mock weight loss (in real app, this would be calculated from weight history)
    const weightLoss = 3.2;

    // Get average daily calories (use user's daily rate)
    const averageDailyCalories = user.infouser?.dailyRate || 1850;

    const stats = {
      streak,
      daysActive,
      totalEntries,
      bmi: Math.round(bmi * 10) / 10,
      weightLoss,
      averageDailyCalories,
    };

    res.status(200).json({
      message: "User statistics retrieved successfully!",
      data: stats,
    });
  } catch (error) {
    throw createHttpError(500, "Failed to get user statistics");
  }
};

export { getUserStats }; 