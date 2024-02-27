import { Controller, Get, HttpCode } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MemoryDescriptor } from "../response.dto";

@ApiTags('Info')
@Controller('info')
@Controller("api/info")
export class HealthCheckController {

    @HttpCode(200)
    @Get('health')
    async healthz() {
      
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