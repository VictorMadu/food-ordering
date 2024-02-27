import { IsInt, Min } from 'class-validator';
import { validateDefined } from 'src/lib/validate';
import { Column } from 'typeorm';

export class Naira {
 
  @Column({ type: 'int', nullable: true })
  @IsInt()
  @Min(0)
  readonly value: number;

  constructor(value: number) {
    this.value = value;
    validateDefined(this);
  }


  multiply(multipler: number): Naira {
    return new Naira(Math.floor(this.value * multipler));
  }

  subtract(other: Naira) {
    return new Naira(this.value - other.value);
  }

  add(other: Naira): Naira {
    return new Naira(this.value + other.value);
  }

  getValue() {
    return this.value;
  }

  equals(other: any) {
    return (
      other instanceof Naira && this.constructor === other.constructor && this.value === other.value
    );
  }
}
