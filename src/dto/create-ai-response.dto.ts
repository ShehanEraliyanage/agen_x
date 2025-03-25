import { ApiProperty } from '@nestjs/swagger';

export class CreateAIResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userInputId: string;

  @ApiProperty()
  response: string;

  @ApiProperty()
  modelUsed: string;
}
