import { OrderDelivered } from "src/domain/model/order/order.entity";
import { DomainEventListener } from "src/presistence/domain-event-listener";
import { OrderRepository } from "src/presistence/repository/order.repository";
import { StoreRepository } from "src/presistence/repository/store.repository";
import { SuperAdminRepository } from "src/presistence/repository/super-admin.repository";
import { VendorRepository } from "src/presistence/repository/vendor.repository";
import { Setting } from "src/setting";
import { EntityManager, EventSubscriber } from "typeorm";

@EventSubscriber()
export class VendorEarningDisbursement extends DomainEventListener<OrderDelivered> {

    event(): new (...args: any[]) => OrderDelivered {
        return OrderDelivered;
    }

   async on(event: OrderDelivered, manager: EntityManager): Promise<void> {
    const orderRepository = new OrderRepository(manager);
    const storeRepository = new StoreRepository(manager);
    const vendorRepository = new VendorRepository(manager);

    const order = await orderRepository.findById(event.aggregateId).get();
    const store = await storeRepository.findById(order.getStoreId()).get()
    const vendor = await vendorRepository.findById(store.owner).get();

    vendor.credit(order.getVendorEarning())
    await vendorRepository.save(vendor);

}
    
}

@EventSubscriber()
export class SuperAdminEarningDisbursement extends DomainEventListener<OrderDelivered> {

    event(): new (...args: any[]) => OrderDelivered {
        return OrderDelivered;
    }

   async on(event: OrderDelivered, manager: EntityManager): Promise<void> {
    const orderRepository = new OrderRepository(manager);
    const superAdminRepository = new SuperAdminRepository(manager);

    const order = await orderRepository.findById(event.aggregateId).get();
    const superAdmin = await superAdminRepository.findByEmail(Setting.superAdmin.email).get();

    superAdmin.credit(order.getSuperAdminEarning())
    await superAdminRepository.save(superAdmin);

}
    
}