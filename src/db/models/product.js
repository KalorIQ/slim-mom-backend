import { Schema } from 'mongoose';

const productsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category {
      type: String,
      required: true,
      enum: ["cereals", "vegetables", "fruits", "dairy", "meat", "eggs", "flour", "dried fruits"],
      ////// burda kaldım devam edeceğim
    },

  },
  {
    timestamps: true,
    versionKey: false,
  },
);
