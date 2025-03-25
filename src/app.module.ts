import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/agent-x',
    ),
  ],
  controllers: [AppController, AgentController],
  providers: [AppService, AgentService],
})
export class AppModule {}
