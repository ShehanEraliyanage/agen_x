import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUserInput } from './userInput.schema';

// Interface representing an AI response document in MongoDB
export interface IAIResponse extends Document {
  response: string;
  userInputId: mongoose.Types.ObjectId;
  userId: string;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  createdAt: Date;
  metadata: Map<string, string>;
}

// Interface for model with static methods
export interface IAIResponseModel extends Model<IAIResponse> {
  getResponseHistory(userId: string, limit?: number): Promise<IAIResponse[]>;
  getConversationThread(
    userId: string,
    limit?: number,
  ): Promise<Array<{ role: string; content: string }>>;
}

const aiResponseSchema = new Schema<IAIResponse>({
  response: {
    type: String,
    required: true,
  },
  userInputId: {
    type: Schema.Types.ObjectId,
    ref: 'UserInput',
    required: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  modelUsed: {
    type: String,
    required: true,
  },
  promptTokens: {
    type: Number,
    default: 0,
  },
  completionTokens: {
    type: Number,
    default: 0,
  },
  totalTokens: {
    type: Number,
    default: 0,
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

// Method to get recent AI responses
aiResponseSchema.statics.getResponseHistory = async function (
  userId: string,
  limit: number = 10,
): Promise<IAIResponse[]> {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userInputId');
};

// Method to format conversation for OpenAI chat models
aiResponseSchema.statics.getConversationThread = async function (
  userId: string,
  limit: number = 10,
): Promise<Array<{ role: string; content: string }>> {
  const responses = await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userInputId');

  const thread: Array<{ role: string; content: string }> = [];

  // Format the conversation in the order it occurred
  for (const response of responses.reverse()) {
    // Add user message
    if (response.userInputId) {
      thread.push({
        role: 'user',
        content: (response.userInputId as unknown as IUserInput).content,
      });
    }

    // Add assistant response
    thread.push({
      role: 'assistant',
      content: response.response,
    });
  }

  return thread;
};

const AIResponse = mongoose.model<IAIResponse, IAIResponseModel>(
  'AIResponse',
  aiResponseSchema,
);

export default AIResponse;
