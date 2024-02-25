import { IsInt } from 'class-validator';
import { Column } from 'typeorm';

export class Naira {
  @Column({ type: 'int' })
  @IsInt()
  value: number;

  constructor(value: number) {
    this.value = value;
  }
}
