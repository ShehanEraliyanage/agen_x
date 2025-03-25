import { Injectable } from '@nestjs/common';
import UserInput from '../schemas/userInput.schema';
import AIResponse from '../schemas/aiResponse.schema';
import * as Papa from 'papaparse';
import SalesData from '../schemas/salesData.schema';
import * as mongoose from 'mongoose';

/**
 * Service layer logic for user input and AI response storage.
 */
@Injectable()
export class AgentService {
  constructor() {
    // Increase Mongoose timeout settings globally
    mongoose.set('bufferTimeoutMS', 60000); // Set buffer timeout to 60 seconds
  }

  async createUserInput(userId: string, content: string) {
    return await UserInput.create({ userId, content });
  }

  async getUserInputSummary(userId: string): Promise<string> {
    return UserInput.getSummaryForAI(userId);
  }

  async createAIResponse(
    userId: string,
    userInputId: string,
    response: string,
    modelUsed: string,
  ) {
    return await AIResponse.create({
      userId,
      userInputId,
      response,
      modelUsed,
    });
  }

  async getAIResponseHistory(userId: string) {
    return AIResponse.getResponseHistory(userId);
  }

  async uploadSalesData(file: Express.Multer.File) {
    const csvContent = file.buffer.toString();
    const parsed = Papa.parse(csvContent, { header: true });
    const rows = parsed.data || [];
    return await SalesData.insertMany(rows);
  }
}
