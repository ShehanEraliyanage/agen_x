import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISalesData extends Document {
  // Adjust fields as needed to match CSV structure
  product: string;
  quantity: number;
  price: number;
}

const salesDataSchema = new Schema<ISalesData>({
  product: String,
  quantity: Number,
  price: Number,
});

const SalesData = mongoose.model<ISalesData, Model<ISalesData>>(
  'SalesData',
  salesDataSchema,
);
export default SalesData;
