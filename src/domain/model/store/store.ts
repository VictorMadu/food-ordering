import { Column, Entity, PrimaryColumn } from 'typeorm';
import { VendorId } from '../vendor/vendor-id';
import { StoreId } from './store-id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { OperationStatus } from './operation-status';
import { InspectionStatus } from './inspection-status';

@Entity()
export class Store {
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(StoreId),
  })
  id: StoreId;

  @Column({
    type: 'uuid',
    transformer: idValueTransformer(VendorId),
    unique: true,
  })
  owner: VendorId;

  @Column({
    type: 'enum',
    enum: OperationStatus,
  })
  operationStatus: OperationStatus;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
  })
  inspectionStatus: InspectionStatus;
}
