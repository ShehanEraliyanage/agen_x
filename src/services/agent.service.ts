import { Injectable } from '@nestjs/common';
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from '@azure/identity';
import { AzureOpenAI } from 'openai';
import * as mongoose from 'mongoose';
import UserInput from '../schemas/userInput.schema';
import AIResponse from '../schemas/aiResponse.schema';
import SalesData from '../schemas/salesData.schema';
import MarketInsight, {
  IMarketInsight,
} from '../schemas/marketInsights.schema';
import Papa from 'papaparse';

@Injectable()
export class AgentService {
  private azureOpenAIClient: AzureOpenAI;

  constructor() {
    const scope = 'https://cognitiveservices.azure.com/.default';
    const azureADTokenProvider = getBearerTokenProvider(
      new DefaultAzureCredential(),
      scope,
    );

    this.azureOpenAIClient = new AzureOpenAI({
      azureADTokenProvider,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_ID,
      apiVersion: '2024-10-21',
    });

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

  async analyzeSalesData(): Promise<any> {
    const salesData = await SalesData.find();
    // Logic for trend analysis and insights generation
    return { trends: [], insights: [] }; // Placeholder
  }

  async createMarketInsight(
    trend: string,
    sentiment: string,
    competitorActivity: string,
  ) {
    return await MarketInsight.create({ trend, sentiment, competitorActivity });
  }

  async getMarketInsights(): Promise<IMarketInsight[]> {
    return await MarketInsight.find().sort({ createdAt: -1 });
  }

  async analyzeWithAI(prompt: string): Promise<string> {
    const events = await this.azureOpenAIClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      model: process.env.AZURE_OPENAI_MODEL,
    });

    let result = '';
    for (const event of events.choices) {
      result += event.message?.content || '';
    }
    return result.trim();
  }

  async chatWithAI(
    messages: Array<{ role: string; content: string; name?: string }>,
  ): Promise<string> {
    const events = await this.azureOpenAIClient.chat.completions.create({
      messages: messages.map((message) => ({
        role: message.role as 'system' | 'user' | 'assistant', // Ensure role matches expected types
        content: message.content,
        name: message.name || 'default',
      })),
      max_tokens: 500,
      model: process.env.AZURE_OPENAI_MODEL,
    });

    let result = '';
    for (const choice of events.choices) {
      result += choice.message?.content || '';
    }
    return result.trim();
  }
}
