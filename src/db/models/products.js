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
    groupBloodNotAllowed: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product; 