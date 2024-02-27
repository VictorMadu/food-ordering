import { Column, Unique } from 'typeorm';

@Unique(['id', 'version'])
export abstract class StateBasedAggregate {
  @Column({ type: 'int' })
  version: number = 0;

  public isNew() {
    return this.version === 0;
  }
}
