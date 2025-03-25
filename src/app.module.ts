import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make configuration available throughout the application
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/agent-x',
    ),
  ],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AppModule {}
