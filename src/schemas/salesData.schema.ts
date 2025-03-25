import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISalesData extends Document {
  // Adjust fields as needed to match CSV structure
  product: string;
  quantity: number;
  price: number;
  brand: string; // New field
  category: string; // New field
  region: string; // New field
}

const salesDataSchema = new Schema<ISalesData>({
  product: String,
  quantity: Number,
  price: Number,
  brand: String, // New field
  category: String, // New field
  region: String, // New field
});

const SalesData = mongoose.model<ISalesData, Model<ISalesData>>(
  'SalesData',
  salesDataSchema,
);
export default SalesData;
