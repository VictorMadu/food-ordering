import { Expose } from 'class-transformer';
import { Max, Min } from 'class-validator';

export class Pagination {
  @Expose()
  @Min(1)
  readonly page: number;

  @Expose()
  @Min(1)
  @Max(200)
  readonly size: number;

  constructor(page: number = 0, size: number = 200) {
    this.page = page;
    this.size = size;
  }

  next(): Pagination {
    return new Pagination(this.page + 1, this.size);
  }

  getOffset(): number {
    return (this.page - 1) * this.size;
  }

  getLimit(): number {
    return this.size;
  }
}
