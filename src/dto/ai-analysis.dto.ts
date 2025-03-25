import { ApiProperty } from '@nestjs/swagger';

export class AIAnalysisDto {
  @ApiProperty()
  prompt: string;
}
