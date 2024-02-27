import { Id } from '../../id';

const c = Symbol()

export class VerificationId extends Id {
    [c] = "c"
}
