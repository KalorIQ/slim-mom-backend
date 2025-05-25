import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    // Macro nutrients (per 100g)
    carbohydrates: {
      type: Number,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
    fiber: {
      type: Number,
      default: 0,
    },
    sugar: {
      type: Number,
      default: 0,
    },
    groupBloodNotAllowed: {
      type: [Boolean],
      default: [false, false, false, false],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Product = mongoose.model('Product', productSchema);

export default Product;
