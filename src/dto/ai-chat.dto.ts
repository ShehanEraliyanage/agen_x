import { ApiProperty } from '@nestjs/swagger';

export class AIChatDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        role: { type: 'string' },
        content: { type: 'string' },
      },
    },
  })
  messages: Array<{ role: string; content: string }>;
}
