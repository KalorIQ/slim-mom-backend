import createHttpError from "http-errors";
import { getProductsForDateService } from "../../services/user.js";

const getUserAchievements = async (req, res) => {
  const owner = req.user._id;
  const user = req.user;

  try {
    // Get last 90 days of data for comprehensive achievement calculation
    const today = new Date();
    const daysData = [];
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      try {
        const products = await getProductsForDateService(owner, dateString);
        daysData.push({
          date: dateString,
          hasEntries: products && products.length > 0,
          entriesCount: products ? products.length : 0,
          products: products || []
        });
      } catch (error) {
        daysData.push({
          date: dateString,
          hasEntries: false,
          entriesCount: 0,
          products: []
        });
      }
    }

    // Calculate achievements
    const achievements = [];

    // Streak achievements
    let currentStreak = 0;
    for (let i = daysData.length - 1; i >= 0; i--) {
      if (daysData[i].hasEntries) {
        currentStreak++;
      } else {
        break;
      }
    }

    if (currentStreak >= 7) {
      achievements.push({
        id: 'week_streak',
        title: '7-Day Streak',
        description: 'Logged food for 7 consecutive days',
        icon: '🔥',
        unlockedAt: new Date().toISOString(),
        category: 'consistency'
      });
    }

    if (currentStreak >= 30) {
      achievements.push({
        id: 'month_streak',
        title: '30-Day Streak',
        description: 'Logged food for 30 consecutive days',
        icon: '🏆',
        unlockedAt: new Date().toISOString(),
        category: 'consistency'
      });
    }

    // Total entries achievements
    const totalEntries = daysData.reduce((sum, day) => sum + day.entriesCount, 0);
    
    if (totalEntries >= 50) {
      achievements.push({
        id: 'entries_50',
        title: 'Food Logger',
        description: 'Logged 50 food items',
        icon: '📝',
        unlockedAt: new Date().toISOString(),
        category: 'logging'
      });
    }

    if (totalEntries >= 100) {
      achievements.push({
        id: 'entries_100',
        title: 'Dedicated Tracker',
        description: 'Logged 100 food items',
        icon: '📊',
        unlockedAt: new Date().toISOString(),
        category: 'logging'
      });
    }

    // Active days achievements
    const activeDays = daysData.filter(day => day.hasEntries).length;
    
    if (activeDays >= 30) {
      achievements.push({
        id: 'active_30',
        title: 'Monthly Tracker',
        description: 'Active for 30 days',
        icon: '📅',
        unlockedAt: new Date().toISOString(),
        category: 'activity'
      });
    }

    // Weight loss achievements (mock based on user data)
    const currentWeight = user.infouser?.currentWeight;
    const targetWeight = user.infouser?.desireWeight;
    
    if (currentWeight && targetWeight && currentWeight <= targetWeight + 2) {
      achievements.push({
        id: 'near_goal',
        title: 'Almost There!',
        description: 'Within 2kg of your goal weight',
        icon: '🎯',
        unlockedAt: new Date().toISOString(),
        category: 'weight'
      });
    }

    // Healthy habits achievements
    const recentDays = daysData.slice(-7);
    const consistentLogging = recentDays.filter(day => day.hasEntries).length >= 5;
    
    if (consistentLogging) {
      achievements.push({
        id: 'consistent_week',
        title: 'Consistent Logger',
        description: 'Logged food 5+ days this week',
        icon: '✅',
        unlockedAt: new Date().toISOString(),
        category: 'habits'
      });
    }

    // Early bird achievement (mock)
    achievements.push({
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Started your health journey',
      icon: '🌅',
      unlockedAt: user.createdAt,
      category: 'milestone'
    });

    // Sort achievements by category and date
    const sortedAchievements = achievements.sort((a, b) => 
      new Date(b.unlockedAt) - new Date(a.unlockedAt)
    );

    // Group by category
    const achievementsByCategory = {
      consistency: sortedAchievements.filter(a => a.category === 'consistency'),
      logging: sortedAchievements.filter(a => a.category === 'logging'),
      activity: sortedAchievements.filter(a => a.category === 'activity'),
      weight: sortedAchievements.filter(a => a.category === 'weight'),
      habits: sortedAchievements.filter(a => a.category === 'habits'),
      milestone: sortedAchievements.filter(a => a.category === 'milestone')
    };

    const result = {
      totalAchievements: achievements.length,
      recentAchievements: sortedAchievements.slice(0, 5),
      allAchievements: sortedAchievements,
      achievementsByCategory,
      stats: {
        currentStreak,
        totalEntries,
        activeDays,
        completionRate: Math.round((activeDays / 90) * 100)
      }
    };

    res.status(200).json({
      message: "User achievements retrieved successfully!",
      data: result,
    });
  } catch (error) {
    throw createHttpError(500, "Failed to get user achievements");
  }
};

export { getUserAchievements }; 