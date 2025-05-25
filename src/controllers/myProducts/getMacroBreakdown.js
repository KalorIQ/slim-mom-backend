import createHttpError from "http-errors";
import { getProductsForDateService } from "../../services/user.js";

const getMacroBreakdown = async (req, res) => {
  const owner = req.user._id;
  const { period = '7days' } = req.query;

  try {
    let days = 7;
    if (period === '30days') days = 30;
    else if (period === '14days') days = 14;

    // Get data for the specified period
    const today = new Date();
    const macroData = {
      totalCalories: 0,
      totalCarbs: 0,
      totalProtein: 0,
      totalFat: 0,
      dailyBreakdown: []
    };
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      try {
        const products = await getProductsForDateService(owner, dateString);
        
        let dayCalories = 0;
        let dayCarbs = 0;
        let dayProtein = 0;
        let dayFat = 0;

        if (products && products.length > 0) {
          products.forEach(product => {
            const weight = product.productWeight;
            const productData = product.productId;
            
            // Calculate macros based on weight (per 100g)
            dayCalories += (productData.calories / 100) * weight;
            dayCarbs += (productData.carbohydrates / 100) * weight;
            dayProtein += (productData.protein / 100) * weight;
            dayFat += (productData.fat / 100) * weight;
          });
        }

        macroData.totalCalories += dayCalories;
        macroData.totalCarbs += dayCarbs;
        macroData.totalProtein += dayProtein;
        macroData.totalFat += dayFat;

        macroData.dailyBreakdown.push({
          date: dateString,
          calories: Math.round(dayCalories),
          carbs: Math.round(dayCarbs * 10) / 10,
          protein: Math.round(dayProtein * 10) / 10,
          fat: Math.round(dayFat * 10) / 10
        });
      } catch (error) {
        macroData.dailyBreakdown.push({
          date: dateString,
          calories: 0,
          carbs: 0,
          protein: 0,
          fat: 0
        });
      }
    }

    // Calculate averages and percentages
    const avgCalories = Math.round(macroData.totalCalories / days);
    const avgCarbs = Math.round((macroData.totalCarbs / days) * 10) / 10;
    const avgProtein = Math.round((macroData.totalProtein / days) * 10) / 10;
    const avgFat = Math.round((macroData.totalFat / days) * 10) / 10;

    // Calculate macro percentages (calories from each macro)
    const carbsCalories = avgCarbs * 4; // 4 calories per gram
    const proteinCalories = avgProtein * 4; // 4 calories per gram
    const fatCalories = avgFat * 9; // 9 calories per gram
    const totalMacroCalories = carbsCalories + proteinCalories + fatCalories;

    const macroPercentages = {
      carbs: totalMacroCalories > 0 ? Math.round((carbsCalories / totalMacroCalories) * 100) : 0,
      protein: totalMacroCalories > 0 ? Math.round((proteinCalories / totalMacroCalories) * 100) : 0,
      fat: totalMacroCalories > 0 ? Math.round((fatCalories / totalMacroCalories) * 100) : 0
    };

    const result = {
      period,
      averages: {
        calories: avgCalories,
        carbs: avgCarbs,
        protein: avgProtein,
        fat: avgFat
      },
      percentages: macroPercentages,
      dailyBreakdown: macroData.dailyBreakdown,
      totals: {
        calories: Math.round(macroData.totalCalories),
        carbs: Math.round(macroData.totalCarbs * 10) / 10,
        protein: Math.round(macroData.totalProtein * 10) / 10,
        fat: Math.round(macroData.totalFat * 10) / 10
      }
    };

    res.status(200).json({
      message: "Macro breakdown retrieved successfully!",
      data: result,
    });
  } catch (error) {
    throw createHttpError(500, "Failed to get macro breakdown");
  }
};

export { getMacroBreakdown }; 