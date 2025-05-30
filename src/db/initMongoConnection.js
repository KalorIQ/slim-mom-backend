import mongoose from "mongoose";
import { env } from "../utils/env.js";

export const initMongoConnection = async () => {
  try {
    const user = env("MONGODB_USER");
    const pwd = env("MONGODB_PASSWORD");
    const url = env("MONGODB_URL");
    const db = env("MONGODB_DB");

    console.info(`Connecting to MongoDB: ${url}/${db}`);
    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.info("Mongo connection successfully established!");
  } catch (e) {
    console.error("Error while setting up mongo connection", e);
    throw e;
  }
};
