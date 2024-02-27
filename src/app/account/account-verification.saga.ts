import { Injectable } from "@nestjs/common";
import { VerificationType } from "src/domain/model/verification/verification-type";
import { VerificationCompleted } from "src/domain/model/verification/verification.entity";
import { DomainEventListener } from "src/presistence/domain-event-listener";
import { SuperAdminRepository } from "src/presistence/repository/super-admin.repository";
import { VendorRepository } from "src/presistence/repository/vendor.repository";
import { VerificationRepository } from "src/presistence/repository/verification.repository";
import { EventSubscriber, EntityManager } from "typeorm";

@EventSubscriber()
@Injectable()
export class AccountVerificationSaga extends DomainEventListener<VerificationCompleted> {
  event(): new (...args: any[]) => VerificationCompleted {
    return VerificationCompleted;
  }

  async on(event: VerificationCompleted, manager: EntityManager): Promise<void> {
    const vendorRepository = new VendorRepository(manager);
    const superAdminRepository = new SuperAdminRepository(manager);
    const verificationRepository = new VerificationRepository(manager);

    const verification = await verificationRepository.findById(event.aggregateId).get();

    switch (verification.verificationType) {
      case VerificationType.ADMIN:
        const superAdmin = await superAdminRepository.findByEmail(verification.email).get();
        superAdmin.verify();
        return superAdminRepository.save(superAdmin);

      case VerificationType.VENDOR:
        const vendor = await vendorRepository.findByEmail(verification.email).get();
        vendor.verify();
        return vendorRepository.save(vendor);

      default:
        throw new Error();
    }
  }
}
