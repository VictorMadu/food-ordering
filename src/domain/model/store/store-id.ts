import { Id } from '../../id';

const c = Symbol()
export class StoreId extends Id {
    [c] = "c"
}
