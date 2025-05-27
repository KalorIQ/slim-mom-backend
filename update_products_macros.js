import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    const user = process.env.MONGODB_USER;
    const pwd = process.env.MONGODB_PASSWORD;
    const url = process.env.MONGODB_URL;
    const db = process.env.MONGODB_DB;

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Product schema
const productSchema = new mongoose.Schema({
  title: String,
  calories: Number,
  weight: Number,
  categories: String,
  carbohydrates: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  groupBloodNotAllowed: [Boolean]
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

// Macro values based on food categories and types (per 100g)
const getMacroValues = (title, category, calories) => {
  const titleLower = title.toLowerCase();
  
  // Fruits
  if (category === 'fruits' || titleLower.includes('apple') || titleLower.includes('banana') || 
      titleLower.includes('orange') || titleLower.includes('grape') || titleLower.includes('berry') ||
      titleLower.includes('cherry') || titleLower.includes('peach') || titleLower.includes('pear')) {
    return {
      carbohydrates: Math.round(calories * 0.85 / 4), // ~85% carbs
      protein: Math.round(calories * 0.05 / 4), // ~5% protein
      fat: Math.round(calories * 0.10 / 9), // ~10% fat
      fiber: Math.round(2 + Math.random() * 3), // 2-5g fiber
      sugar: Math.round(calories * 0.70 / 4) // ~70% sugar
    };
  }
  
  // Cereals and grains
  if (category === 'cereals' || titleLower.includes('oat') || titleLower.includes('rice') || 
      titleLower.includes('wheat') || titleLower.includes('flour') || titleLower.includes('bread') ||
      titleLower.includes('pasta') || titleLower.includes('cereal')) {
    return {
      carbohydrates: Math.round(calories * 0.70 / 4), // ~70% carbs
      protein: Math.round(calories * 0.15 / 4), // ~15% protein
      fat: Math.round(calories * 0.15 / 9), // ~15% fat
      fiber: Math.round(3 + Math.random() * 7), // 3-10g fiber
      sugar: Math.round(calories * 0.10 / 4) // ~10% sugar
    };
  }
  
  // Meat and fish
  if (titleLower.includes('beef') || titleLower.includes('pork') || titleLower.includes('chicken') ||
      titleLower.includes('turkey') || titleLower.includes('fish') || titleLower.includes('salmon') ||
      titleLower.includes('tuna') || titleLower.includes('meat') || titleLower.includes('sausage')) {
    return {
      carbohydrates: Math.round(calories * 0.05 / 4), // ~5% carbs
      protein: Math.round(calories * 0.60 / 4), // ~60% protein
      fat: Math.round(calories * 0.35 / 9), // ~35% fat
      fiber: 0, // No fiber in meat
      sugar: 0 // No sugar in meat
    };
  }
  
  // Dairy products
  if (titleLower.includes('cheese') || titleLower.includes('milk') || titleLower.includes('yogurt') ||
      titleLower.includes('butter') || titleLower.includes('cream') || titleLower.includes('cottage')) {
    return {
      carbohydrates: Math.round(calories * 0.15 / 4), // ~15% carbs
      protein: Math.round(calories * 0.25 / 4), // ~25% protein
      fat: Math.round(calories * 0.60 / 9), // ~60% fat
      fiber: 0, // No fiber in dairy
      sugar: Math.round(calories * 0.12 / 4) // ~12% sugar (lactose)
    };
  }
  
  // Nuts and seeds
  if (titleLower.includes('nut') || titleLower.includes('almond') || titleLower.includes('walnut') ||
      titleLower.includes('seed') || titleLower.includes('peanut') || titleLower.includes('cashew')) {
    return {
      carbohydrates: Math.round(calories * 0.20 / 4), // ~20% carbs
      protein: Math.round(calories * 0.20 / 4), // ~20% protein
      fat: Math.round(calories * 0.60 / 9), // ~60% fat
      fiber: Math.round(5 + Math.random() * 10), // 5-15g fiber
      sugar: Math.round(calories * 0.05 / 4) // ~5% sugar
    };
  }
  
  // Vegetables
  if (category === 'vegetables' || titleLower.includes('carrot') || titleLower.includes('potato') ||
      titleLower.includes('tomato') || titleLower.includes('onion') || titleLower.includes('pepper') ||
      titleLower.includes('cabbage') || titleLower.includes('spinach') || titleLower.includes('broccoli')) {
    return {
      carbohydrates: Math.round(calories * 0.75 / 4), // ~75% carbs
      protein: Math.round(calories * 0.15 / 4), // ~15% protein
      fat: Math.round(calories * 0.10 / 9), // ~10% fat
      fiber: Math.round(2 + Math.random() * 6), // 2-8g fiber
      sugar: Math.round(calories * 0.40 / 4) // ~40% sugar
    };
  }
  
  // Oils and fats
  if (titleLower.includes('oil') || titleLower.includes('fat') || titleLower.includes('margarine')) {
    return {
      carbohydrates: 0, // No carbs in pure fats
      protein: 0, // No protein in pure fats
      fat: Math.round(calories / 9), // ~100% fat
      fiber: 0, // No fiber in oils
      sugar: 0 // No sugar in oils
    };
  }
  
  // Default values for unknown categories
  return {
    carbohydrates: Math.round(calories * 0.50 / 4), // ~50% carbs
    protein: Math.round(calories * 0.25 / 4), // ~25% protein
    fat: Math.round(calories * 0.25 / 9), // ~25% fat
    fiber: Math.round(1 + Math.random() * 4), // 1-5g fiber
    sugar: Math.round(calories * 0.20 / 4) // ~20% sugar
  };
};

const updateProductMacros = async () => {
  try {
    await connectDB();
    
    console.log('Starting to update product macros...');
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      try {
        // Skip if already has macro values
        if (product.protein > 0 || product.fat > 0 || product.carbohydrates > 0) {
          continue;
        }
        
        const macros = getMacroValues(product.title, product.categories, product.calories);
        
        await Product.findByIdAndUpdate(product._id, {
          carbohydrates: macros.carbohydrates,
          protein: macros.protein,
          fat: macros.fat,
          fiber: macros.fiber,
          sugar: macros.sugar
        });
        
        updatedCount++;
        
        if (updatedCount % 100 === 0) {
          console.log(`Updated ${updatedCount} products...`);
        }
        
      } catch (error) {
        console.error(`Error updating product ${product.title}:`, error);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} products with macro values!`);
    
    // Test a few updated products
    console.log('\nSample updated products:');
    const sampleProducts = await Product.find({}).limit(5);
    sampleProducts.forEach(product => {
      console.log(`${product.title}: Carbs: ${product.carbohydrates}g, Protein: ${product.protein}g, Fat: ${product.fat}g`);
    });
    
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the update
updateProductMacros(); 