import { Module } from '@nestjs/common';
import { ControllerModule } from './controller/controller.module';
import { PresistenceModule } from './presistence/presistence.module';

@Module({
  imports: [ControllerModule, PresistenceModule],
})
export class AppModule {}
