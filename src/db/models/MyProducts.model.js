import mongoose from "mongoose";

const myProductSchema = new mongoose.Schema({
  productWeight: {
    type: Number,
    required: [true, "Product weight is required"],
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: [true, "Product id is required"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
});

const MyProducts = mongoose.model("MyProducts", myProductSchema);
export { MyProducts };
