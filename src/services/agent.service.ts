import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
// Import PapaParse library
import * as Papa from 'papaparse';

@Injectable()
export class AgentService {
  private readonly openaiClient: AzureOpenAI;

  constructor(private configService: ConfigService) {
    this.openaiClient = new AzureOpenAI({
      apiKey: this.configService.get<string>('AZURE_OPENAI_API_KEY'),
      endpoint: this.configService.get<string>('AZURE_OPENAI_ENDPOINT'),
      deployment: this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT_ID'),
      apiVersion:
        this.configService.get<string>('OPENAI_API_VERSION') ||
        '2023-12-01-preview',
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
    try {
      const csvContent = file.buffer.toString();

      if (!Papa || typeof Papa.parse !== 'function') {
        throw new Error('PapaParse library is not properly loaded');
      }

      const parsed = Papa.parse(csvContent, { header: true });
      const rows = parsed.data || [];
      const savedData = await SalesData.create({ data: rows });
      return { id: savedData._id, message: 'CSV data saved successfully' };
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
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
    const events = await this.openaiClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      model: this.configService.get<string>('AZURE_OPENAI_MODEL'),
    });

    let result = '';
    for (const event of events.choices) {
      result += event.message?.content || '';
    }
    return result.trim();
  }

  async chatWithAI(
    csvId: string,
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    const salesData = await SalesData.findById(csvId);
    if (!salesData) {
      throw new Error('CSV data not found');
    }

    const contextMessage = {
      role: 'system',
      content: `You are an assistant analyzing the following sales data: ${JSON.stringify(salesData.data)}`,
      name: 'sales_data_analysis', // Added 'name' property to match expected type
    };

    const events = await this.openaiClient.chat.completions.create({
      messages: [contextMessage as any, ...messages], // Cast contextMessage to 'any' if strict typing issues persist
      max_tokens: 500,
      model: this.configService.get<string>('AZURE_OPENAI_MODEL'),
    });

    let result = '';
    for (const choice of events.choices) {
      result += choice.message?.content || '';
    }
    return result.trim();
  }
}
