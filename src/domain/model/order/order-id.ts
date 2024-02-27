import { Id } from 'src/domain/id';

const c = Symbol()

export class OrderId extends Id {
    [c] = "c"
}
