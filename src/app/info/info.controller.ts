import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MemoryDescriptor } from '../response.dto';
import { Expose } from 'class-transformer';

class Message {
  @Expose()
  readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}
@ApiTags('Info')
@Controller('api/info')
export class HealthCheckController {
  @HttpCode(200)
  @Get('health')
  async healthz() {}

  @HttpCode(200)
  @Get('hello')
  async hello() {
    return new Message("Hello world")
  }


  @Get('memory')
  async memory(): Promise<MemoryDescriptor> {
    const memory = (process as any).memoryUsage();
    const used = memory.heapUsed / 1024 / 1024;
    const rss = memory.rss / 1024 / 1024;
    const total = memory.heapTotal / 1024 / 1024;
    const external = memory.external / 1024 / 1024;

    return new MemoryDescriptor(used, rss, total, external, 'MegaBytes');
  }
}


