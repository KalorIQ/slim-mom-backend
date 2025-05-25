import createHttpError from "http-errors";
import { getProductsForDateService } from "../../services/user.js";

const getComprehensiveStats = async (req, res) => {
  const owner = req.user._id;
  const user = req.user;

  try {
    // Get last 90 days of data for comprehensive analysis
    const today = new Date();
    const daysData = [];
    
    for (let i = 89; i >= 0; i--) {
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
            
            dayCalories += (productData.calories / 100) * weight;
            dayCarbs += (productData.carbohydrates / 100) * weight;
            dayProtein += (productData.protein / 100) * weight;
            dayFat += (productData.fat / 100) * weight;
          });
        }

        daysData.push({
          date: dateString,
          hasEntries: products && products.length > 0,
          entriesCount: products ? products.length : 0,
          calories: dayCalories,
          macros: { carbs: dayCarbs, protein: dayProtein, fat: dayFat }
        });
      } catch (error) {
        daysData.push({
          date: dateString,
          hasEntries: false,
          entriesCount: 0,
          calories: 0,
          macros: { carbs: 0, protein: 0, fat: 0 }
        });
      }
    }

    // Calculate comprehensive statistics
    const activeDays = daysData.filter(day => day.hasEntries).length;
    const totalEntries = daysData.reduce((sum, day) => sum + day.entriesCount, 0);
    
    // Calculate streaks
    let currentStreak = 0;
    for (let i = daysData.length - 1; i >= 0; i--) {
      if (daysData[i].hasEntries) {
        currentStreak++;
      } else {
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    for (const day of daysData) {
      if (day.hasEntries) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate calorie statistics
    const activeDaysData = daysData.filter(day => day.hasEntries);
    const totalCalories = activeDaysData.reduce((sum, day) => sum + day.calories, 0);
    const averageCalories = activeDays > 0 ? Math.round(totalCalories / activeDays) : 0;
    
    const dailyGoal = user.infouser?.dailyRate || 1850;
    const daysOnTarget = activeDaysData.filter(day => 
      day.calories >= dailyGoal * 0.9 && day.calories <= dailyGoal * 1.1
    ).length;

    // Calculate macro statistics
    const totalMacros = activeDaysData.reduce((acc, day) => ({
      carbs: acc.carbs + day.macros.carbs,
      protein: acc.protein + day.macros.protein,
      fat: acc.fat + day.macros.fat
    }), { carbs: 0, protein: 0, fat: 0 });

    const averageMacros = {
      carbs: activeDays > 0 ? Math.round((totalMacros.carbs / activeDays) * 10) / 10 : 0,
      protein: activeDays > 0 ? Math.round((totalMacros.protein / activeDays) * 10) / 10 : 0,
      fat: activeDays > 0 ? Math.round((totalMacros.fat / activeDays) * 10) / 10 : 0
    };

    // Calculate BMI and health metrics
    const height = user.infouser?.height;
    const currentWeight = user.infouser?.currentWeight;
    const targetWeight = user.infouser?.desireWeight;
    
    let bmi = 24.1;
    if (height && currentWeight) {
      const heightInM = height / 100;
      bmi = currentWeight / (heightInM * heightInM);
    }

    // Calculate progress metrics
    const weightLoss = currentWeight && targetWeight ? Math.max(0, currentWeight - targetWeight) : 0;
    const progressToGoal = currentWeight && targetWeight ? 
      Math.min(100, Math.round(((currentWeight - targetWeight) / (currentWeight - targetWeight)) * 100)) : 0;

    // Weekly trends (last 4 weeks)
    const weeklyTrends = [];
    for (let week = 3; week >= 0; week--) {
      const weekStart = week * 7;
      const weekEnd = weekStart + 7;
      const weekData = daysData.slice(-(weekEnd), -(weekStart) || undefined);
      
      const weekActiveDays = weekData.filter(day => day.hasEntries).length;
      const weekCalories = weekData.reduce((sum, day) => sum + day.calories, 0);
      const weekAvgCalories = weekActiveDays > 0 ? Math.round(weekCalories / weekActiveDays) : 0;
      
      weeklyTrends.push({
        week: `Week ${4 - week}`,
        activeDays: weekActiveDays,
        averageCalories: weekAvgCalories,
        totalEntries: weekData.reduce((sum, day) => sum + day.entriesCount, 0)
      });
    }

    // Health score calculation
    const consistencyScore = Math.round((activeDays / 90) * 100);
    const streakScore = Math.min(100, currentStreak * 5);
    const targetScore = activeDays > 0 ? Math.round((daysOnTarget / activeDays) * 100) : 0;
    const overallHealthScore = Math.round((consistencyScore + streakScore + targetScore) / 3);

    const comprehensiveStats = {
      overview: {
        activeDays,
        totalEntries,
        currentStreak,
        longestStreak,
        averageCalories,
        daysOnTarget,
        healthScore: overallHealthScore
      },
      nutrition: {
        averageMacros,
        totalMacros: {
          carbs: Math.round(totalMacros.carbs * 10) / 10,
          protein: Math.round(totalMacros.protein * 10) / 10,
          fat: Math.round(totalMacros.fat * 10) / 10
        },
        macroPercentages: {
          carbs: averageCalories > 0 ? Math.round((averageMacros.carbs * 4 / averageCalories) * 100) : 0,
          protein: averageCalories > 0 ? Math.round((averageMacros.protein * 4 / averageCalories) * 100) : 0,
          fat: averageCalories > 0 ? Math.round((averageMacros.fat * 9 / averageCalories) * 100) : 0
        }
      },
      health: {
        bmi: Math.round(bmi * 10) / 10,
        currentWeight,
        targetWeight,
        weightLoss,
        progressToGoal,
        dailyGoal
      },
      trends: {
        weeklyTrends,
        last30Days: daysData.slice(-30).map(day => ({
          date: day.date,
          calories: Math.round(day.calories),
          hasEntries: day.hasEntries
        }))
      },
      scores: {
        consistency: consistencyScore,
        streak: streakScore,
        target: targetScore,
        overall: overallHealthScore
      }
    };

    res.status(200).json({
      message: "Comprehensive user statistics retrieved successfully!",
      data: comprehensiveStats,
    });
  } catch (error) {
    throw createHttpError(500, "Failed to get comprehensive user statistics");
  }
};

export { getComprehensiveStats }; 