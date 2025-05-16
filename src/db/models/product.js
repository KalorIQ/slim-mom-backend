import { Schema } from 'mongoose';

const productsSchema = new mongoose.Schema(
  {
    categories: {
      type: String,
    },
    weight: {
      type: Number,
    },
    title: {
      type: String,
    },
    calories: {
      type: Number,
    },
    groupBloodNotAllowed: {
      type: [Boolean],
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
