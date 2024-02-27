import { Id } from 'src/domain/id';

const c = Symbol()

export class FoodCookingSpaceId extends Id {
    [c] = "c"
}
