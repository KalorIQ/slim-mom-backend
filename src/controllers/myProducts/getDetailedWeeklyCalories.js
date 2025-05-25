import createHttpError from "http-errors";
import { getProductsForDateService } from "../../services/user.js";

const getDetailedWeeklyCalories = async (req, res) => {
  const owner = req.user._id;
  const user = req.user;

  try {
    // Get last 7 days of detailed data
    const weeklyData = [];
    const dates = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dates.push(dateString);
    }

    // Get products for each date with detailed breakdown
    for (const dateString of dates) {
      try {
        const products = await getProductsForDateService(owner, dateString);
        
        let totalCalories = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        let totalFat = 0;
        let mealBreakdown = {
          breakfast: { calories: 0, items: 0 },
          lunch: { calories: 0, items: 0 },
          dinner: { calories: 0, items: 0 },
          snacks: { calories: 0, items: 0 }
        };

        if (products && products.length > 0) {
          products.forEach((product, index) => {
            const weight = product.productWeight;
            const productData = product.productId;
            
            const productCalories = (productData.calories / 100) * weight;
            const productCarbs = (productData.carbohydrates / 100) * weight;
            const productProtein = (productData.protein / 100) * weight;
            const productFat = (productData.fat / 100) * weight;

            totalCalories += productCalories;
            totalCarbs += productCarbs;
            totalProtein += productProtein;
            totalFat += productFat;

            // Simulate meal distribution (in real app, this would be stored)
            const hour = new Date(product.createdAt || new Date()).getHours();
            let mealType = 'snacks';
            if (hour >= 6 && hour < 11) mealType = 'breakfast';
            else if (hour >= 11 && hour < 16) mealType = 'lunch';
            else if (hour >= 16 && hour < 22) mealType = 'dinner';

            mealBreakdown[mealType].calories += productCalories;
            mealBreakdown[mealType].items += 1;
          });
        }

        // Get day name
        const dayName = new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
        
        weeklyData.push({
          date: dateString,
          dayName,
          calories: Math.round(totalCalories),
          macros: {
            carbs: Math.round(totalCarbs * 10) / 10,
            protein: Math.round(totalProtein * 10) / 10,
            fat: Math.round(totalFat * 10) / 10
          },
          mealBreakdown: {
            breakfast: {
              calories: Math.round(mealBreakdown.breakfast.calories),
              items: mealBreakdown.breakfast.items
            },
            lunch: {
              calories: Math.round(mealBreakdown.lunch.calories),
              items: mealBreakdown.lunch.items
            },
            dinner: {
              calories: Math.round(mealBreakdown.dinner.calories),
              items: mealBreakdown.dinner.items
            },
            snacks: {
              calories: Math.round(mealBreakdown.snacks.calories),
              items: mealBreakdown.snacks.items
            }
          },
          entriesCount: products ? products.length : 0,
          goalMet: totalCalories >= (user.infouser?.dailyRate * 0.8 || 1480) && 
                   totalCalories <= (user.infouser?.dailyRate * 1.2 || 2220)
        });
      } catch (error) {
        const dayName = new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
        weeklyData.push({
          date: dateString,
          dayName,
          calories: 0,
          macros: { carbs: 0, protein: 0, fat: 0 },
          mealBreakdown: {
            breakfast: { calories: 0, items: 0 },
            lunch: { calories: 0, items: 0 },
            dinner: { calories: 0, items: 0 },
            snacks: { calories: 0, items: 0 }
          },
          entriesCount: 0,
          goalMet: false
        });
      }
    }

    // Calculate weekly statistics
    const totalWeeklyCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);
    const averageDailyCalories = Math.round(totalWeeklyCalories / 7);
    const daysWithGoalMet = weeklyData.filter(day => day.goalMet).length;
    const totalEntries = weeklyData.reduce((sum, day) => sum + day.entriesCount, 0);
    const activeDays = weeklyData.filter(day => day.entriesCount > 0).length;

    // Calculate weekly macro averages
    const weeklyMacros = weeklyData.reduce((acc, day) => ({
      carbs: acc.carbs + day.macros.carbs,
      protein: acc.protein + day.macros.protein,
      fat: acc.fat + day.macros.fat
    }), { carbs: 0, protein: 0, fat: 0 });

    const result = {
      weeklyData,
      statistics: {
        totalWeeklyCalories,
        averageDailyCalories,
        daysWithGoalMet,
        totalEntries,
        activeDays,
        weeklyMacros: {
          carbs: Math.round(weeklyMacros.carbs * 10) / 10,
          protein: Math.round(weeklyMacros.protein * 10) / 10,
          fat: Math.round(weeklyMacros.fat * 10) / 10
        },
        averageMacros: {
          carbs: Math.round((weeklyMacros.carbs / 7) * 10) / 10,
          protein: Math.round((weeklyMacros.protein / 7) * 10) / 10,
          fat: Math.round((weeklyMacros.fat / 7) * 10) / 10
        }
      },
      goalCalories: user.infouser?.dailyRate || 1850
    };

    res.status(200).json({
      message: "Detailed weekly calories data retrieved successfully!",
      data: result,
    });
  } catch (error) {
    throw createHttpError(500, "Failed to get detailed weekly calories data");
  }
};

export { getDetailedWeeklyCalories }; 