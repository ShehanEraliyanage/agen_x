import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AgentService } from '../services/agent.service';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateUserInputDto } from '../dto/create-user-input.dto';
import { CreateAIResponseDto } from '../dto/create-ai-response.dto';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('user-input')
  async createUserInput(@Body() body: CreateUserInputDto) {
    const { userId, content } = body;
    return this.agentService.createUserInput(userId, content);
  }

  @Get('summary/:userId')
  async getSummary(@Param('userId') userId: string) {
    const summary = await this.agentService.getUserInputSummary(userId);
    return { summary };
  }

  @Post('ai-response')
  async createAIResponse(@Body() body: CreateAIResponseDto) {
    const { userId, userInputId, response, modelUsed } = body;
    return this.agentService.createAIResponse(
      userId,
      userInputId,
      response,
      modelUsed,
    );
  }

  @Get('ai-history/:userId')
  async getAIHistory(@Param('userId') userId: string) {
    return this.agentService.getAIResponseHistory(userId);
  }

  @Post('upload-sales-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 }, // Set file size limit to 100MB
      fileFilter: (req, file, callback) => {
        const validMimeTypes = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/csv',
          'text/x-csv',
          'application/x-csv',
        ];
        if (validMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only CSV files are allowed'),
            false,
          );
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Upload a CSV file',
        },
      },
    },
  })
  async uploadSalesData(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.agentService.uploadSalesData(file);
  }
}
