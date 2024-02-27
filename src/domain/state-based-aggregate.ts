import { VersionColumn } from 'typeorm';

export abstract class StateBasedAggregate {
  @VersionColumn({ type: 'int' })
  version: number = 0;

  public isNew() {
    return this.version === 0;
  }
}
