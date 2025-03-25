import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AgentService } from '../services/agent.service';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

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

  @Post('chat-with-ai')
  async chatWithAI(
    @Body()
    body: {
      csvId: string;
      messages: Array<{ role: string; content: string }>;
    },
  ) {
    const { csvId, messages } = body;
    return this.agentService.chatWithAI(csvId, messages);
  }
}
