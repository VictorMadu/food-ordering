import { Id } from '../../id';

const c = Symbol()

export class VendorId extends Id {
    [c] = "c"
}
