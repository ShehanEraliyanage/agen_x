import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface representing a document in MongoDB
export interface IUserInput extends Document {
  content: string;
  userId: string;
  createdAt: Date;
  metadata: Map<string, string>;
}

// Interface for model with static methods
export interface IUserInputModel extends Model<IUserInput> {
  getSummaryForAI(userId: string, limit?: number): Promise<string>;
}

const userInputSchema = new Schema<IUserInput>({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
});

// Method to get summarized user inputs for OpenAI
userInputSchema.statics.getSummaryForAI = async function (
  userId: string,
  limit: number = 10,
): Promise<string> {
  const inputs = await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return inputs.map((input) => input.content).join('\n');
};

const UserInput = mongoose.model<IUserInput, IUserInputModel>(
  'UserInput',
  userInputSchema,
);

export default UserInput;
