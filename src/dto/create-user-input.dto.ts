import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInputDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  content: string;
}
