import { ApiProperty } from '@nestjs/swagger';

export class CreateMarketInsightDto {
  @ApiProperty()
  trend: string;

  @ApiProperty()
  sentiment: string;

  @ApiProperty()
  competitorActivity: string;
}
