import { Column } from 'typeorm';

export enum OperationStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum Orchestrator {
  VENDOR = 'VENDOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class StoreState {
  @Column({
    type: 'enum',
    enum: OperationStatus,
  })
  operationStatus: OperationStatus;

  @Column({
    type: 'enum',
    enum: Orchestrator,
  })
  orchestrator: Orchestrator;

  public constructor(operationStatus: OperationStatus, orchestrator: Orchestrator) {
    this.operationStatus = operationStatus;
    this.orchestrator = orchestrator;
  }

  isClosed(): boolean {
    return this.operationStatus === OperationStatus.CLOSED;
  }

  isClosedBySuperAdmin() {
    return this.isClosed() && this.orchestrator === Orchestrator.SUPER_ADMIN;
  }


  isOpened(): boolean {
    return this.operationStatus === OperationStatus.OPEN;
  }
}
