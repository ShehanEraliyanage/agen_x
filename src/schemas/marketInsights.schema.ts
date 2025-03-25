import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketInsight extends Document {
  trend: string;
  sentiment: string;
  competitorActivity: string;
  createdAt: Date;
}

const marketInsightsSchema = new Schema<IMarketInsight>({
  trend: { type: String, required: true },
  sentiment: { type: String, required: true },
  competitorActivity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MarketInsight = mongoose.model<IMarketInsight>(
  'MarketInsight',
  marketInsightsSchema,
);

export default MarketInsight;
