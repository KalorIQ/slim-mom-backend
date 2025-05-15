import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const initMongoConnection = async () => {
  try {
    const {
      MONGODB_USER,
      MONGODB_PASSWORD,
      MONGODB_URL,
      MONGODB_DB,
      MONGODB_OPTIONS,
    } = process.env;

    const mongoDbUrl = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?${MONGODB_OPTIONS}`;
    await mongoose.connect(mongoDbUrl);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.log('Error connecting to MongoDB!', error);
  }
};

export default initMongoConnection;
