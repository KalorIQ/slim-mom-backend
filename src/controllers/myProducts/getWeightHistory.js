import createHttpError from "http-errors";

const getWeightHistory = async (req, res) => {
  const user = req.user;

  try {
    // Get user's current weight from infouser
    const currentWeight = user.infouser?.currentWeight || 70;
    const targetWeight = user.infouser?.desireWeight || 65;
    
    // For now, generate mock weight history data
    // In a real application, this would come from a weight tracking collection
    const weightHistory = [];
    const today = new Date();
    
    // Generate 12 weeks of mock data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7)); // Weekly data
      
      // Simulate gradual weight loss
      const progressRatio = (11 - i) / 11;
      const weightDifference = currentWeight - targetWeight;
      const simulatedWeight = currentWeight - (weightDifference * progressRatio * 0.7); // 70% progress
      
      weightHistory.push({
        date: date.toISOString().split('T')[0],
        weight: Math.round(simulatedWeight * 10) / 10,
        week: `Week ${12 - i}`
      });
    }

    // Calculate weight loss statistics
    const startWeight = weightHistory[0].weight;
    const endWeight = weightHistory[weightHistory.length - 1].weight;
    const totalWeightLoss = Math.round((startWeight - endWeight) * 10) / 10;
    const averageWeeklyLoss = Math.round((totalWeightLoss / 12) * 10) / 10;
    const progressToGoal = targetWeight ? Math.round(((startWeight - endWeight) / (startWeight - targetWeight)) * 100) : 0;

    const stats = {
      currentWeight: endWeight,
      startWeight,
      targetWeight,
      totalWeightLoss,
      averageWeeklyLoss,
      progressToGoal: Math.min(progressToGoal, 100),
      weightHistory
    };

    res.status(200).json({
      message: "Weight history retrieved successfully!",
      data: stats,
    });
  } catch (error) {
    throw createHttpError(500, "Failed to get weight history");
  }
};

export { getWeightHistory }; 