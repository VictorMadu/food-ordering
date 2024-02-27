import { Expose } from "class-transformer";
import { Naira } from "../naira";
import { validateDefined } from "src/lib/validate";
import { Column } from "typeorm";
import { DomainException } from "src/domain/exception/domain.exception";

export class OrderEarnings {
    
    @Expose()
    @Column(() => Naira)
    readonly superAdmin: Naira;
  
    @Expose()
    @Column(() => Naira)
    readonly vendor: Naira;

    constructor(superAdmin: Naira, vendor: Naira) {
        this.superAdmin = superAdmin;
        this.vendor = vendor;

        validateDefined(this)
    }

    static calculate(
        totalBill: Naira,
        vendorToAdminSplitFactor: number 
    ): OrderEarnings {
        if (vendorToAdminSplitFactor < 0 || vendorToAdminSplitFactor > 1) {
            throw new DomainException("INVALID_SPLIT_FACTOR")
        } 

        const vendor = totalBill.multiply(vendorToAdminSplitFactor);
        const superAdmin = totalBill.subtract(vendor);

        return new OrderEarnings(superAdmin, vendor);
    }
}