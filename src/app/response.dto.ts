import { Expose } from "class-transformer";

export class MemoryDescriptor {

    @Expose()
    readonly unit: string;

    @Expose()
    readonly rss: number;

    @Expose()
    readonly heapTotal: number;

    @Expose()
    readonly heapUsed: number;

    @Expose()
    readonly external: number;
  
    constructor(heapUsed: number, rss: number, heapTotal: number, external: number, unit: string) {
      this.rss = rss;
      this.unit = unit;
      this.heapTotal = heapTotal;
      this.heapUsed = heapUsed;
      this.external = external;
    }
  }
  