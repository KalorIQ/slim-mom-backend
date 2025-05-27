import mongoose from 'mongoose';
import userCollection from './src/db/models/user.js';
import { calculateCalory } from './src/utils/calculateCalory.js';
import { getNotAllowedFoodsService } from './src/services/user.js';

const MONGODB_URI = 'mongodb+srv://kaloriq:kaloriq123@kaloriq.3aizjs7.mongodb.net/products';

async function updateUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user
    const user = await userCollection.findOne({ email: 'atig@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.name, user.email);
    console.log('Current infouser:', user.infouser);

    // Realistic test data for a user
    const testUserData = {
      currentWeight: 75,      // 75 kg
      height: 175,           // 175 cm
      age: 28,               // 28 years old
      desireWeight: 68,      // Target: 68 kg
      bloodType: 2,          // Blood type A (2)
    };

    // Calculate daily calorie needs
    const dailyRate = calculateCalory({
      currentWeight: testUserData.currentWeight,
      height: testUserData.height,
      age: testUserData.age,
      desireWeight: testUserData.desireWeight,
    });

    // Get not allowed foods for blood type
    const notAllowedFoods = await getNotAllowedFoodsService(testUserData.bloodType);

    // Update user with complete infouser data
    const updatedUser = await userCollection.findByIdAndUpdate(
      user._id,
      {
        'infouser.currentWeight': testUserData.currentWeight,
        'infouser.height': testUserData.height,
        'infouser.age': testUserData.age,
        'infouser.desireWeight': testUserData.desireWeight,
        'infouser.bloodType': testUserData.bloodType,
        'infouser.dailyRate': dailyRate,
        'infouser.notAllowedProducts': notAllowedFoods,
        'infouser.notAllowedProductsAll': notAllowedFoods,
      },
      { new: true }
    );

    console.log('✅ User updated successfully!');
    console.log('Updated infouser:', {
      currentWeight: updatedUser.infouser.currentWeight,
      height: updatedUser.infouser.height,
      age: updatedUser.infouser.age,
      desireWeight: updatedUser.infouser.desireWeight,
      bloodType: updatedUser.infouser.bloodType,
      dailyRate: updatedUser.infouser.dailyRate,
      notAllowedProductsCount: updatedUser.infouser.notAllowedProducts?.length || 0,
    });

    console.log('\n🎯 User is now ready for endpoint testing!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

updateUser(); 