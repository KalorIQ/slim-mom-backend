import createHttpError from "http-errors";

const getWeightProgress = async (req, res) => {
  const user = req.user;

  try {
    // Get user's current weight from infouser
    const currentWeight = user.infouser?.currentWeight || 70;
    
    // For now, generate mock weekly progress data
    // In a real application, this would come from a weight tracking collection
    const weeklyProgress = [
      { week: 'Week 1', weight: Math.round((currentWeight + 3.2) * 10) / 10 },
      { week: 'Week 2', weight: Math.round((currentWeight + 2.1) * 10) / 10 },
      { week: 'Week 3', weight: Math.round((currentWeight + 1.0) * 10) / 10 },
      { week: 'Week 4', weight: Math.round(currentWeight * 10) / 10 },
    ];

    res.status(200).json({
      message: "Weight progress data retrieved successfully!",
      data: weeklyProgress,
    });
  } catch (error) {
    throw createHttpError(500, "Failed to get weight progress data");
  }
};

export { getWeightProgress }; 