import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },
    infouser: {
      currentWeight: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
      age: {
        type: Number,
        default: null,
      },
      desireWeight: {
        type: Number,
        default: null,
      },
      bloodType: {
        type: Number,
        default: null,
      },
      dailyRate: {
        type: Number,
        default: null,
      },
      notAllowedProducts: {
        type: [String],
        default: null,
      },
      notAllowedProductsAll: {
        type: [String],
        default: null,
      },
    },
  },

  {
    versionKey: false,
    timestamps: true,
  },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const userCollection = model('user', userSchema);

export default userCollection;
