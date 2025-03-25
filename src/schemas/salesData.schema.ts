import mongoose, { Document, Schema } from 'mongoose';

export interface ISalesData extends Document {
  data: Array<Record<string, any>>; // Store CSV rows as an array of objects
}

const salesDataSchema = new Schema<ISalesData>({
  data: [{ type: Map, of: Schema.Types.Mixed }], // Using array notation with Map type
});

const SalesData = mongoose.model<ISalesData>('SalesData', salesDataSchema);
export default SalesData;
