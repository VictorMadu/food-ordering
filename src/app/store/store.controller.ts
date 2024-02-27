import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { VendorId } from "src/domain/model/user/vendor-id";
import { FoodCookingSpaceRepository } from "src/presistence/repository/food-cooking-space.repository";
import { StoreRepository } from "src/presistence/repository/store.repository";
import { VerifiedVendorGuard, AuthVendorId, VerifiedSuperAdminGuard } from "../auth.guard";
import * as req from "../request.dto";
import { Store } from "src/domain/model/store/store.entity";
import { FoodCookingSpace } from "src/domain/model/store/food-cooking-space.entity";
import { StoreId } from "src/domain/model/store/store-id";

@ApiTags('Store')
@Controller('api/store')
export class StoreController {

    constructor(
        private storeRepository: StoreRepository,
        private foodCookingSpaceRepository: FoodCookingSpaceRepository,
      ) {}

      
    @Post()
  @UseGuards(VerifiedVendorGuard)
  async createStore(@AuthVendorId() id: VendorId, @Body() body: req.Store) {
    const store = new Store();
    store.create(id, body.name);

    await this.storeRepository.save(store);
  }

  @Post('sales/open')
  @UseGuards(VerifiedVendorGuard)
  async openStoreForSales(@AuthVendorId() id: VendorId): Promise<void> {
    const store = await this.storeRepository.findByOwner(id).get();
    store.openForSales();
    await this.storeRepository.save(store);
  }

  @Post('sales/close')
  @UseGuards(VerifiedVendorGuard)
  async closeStoreAfterSales(@AuthVendorId() id: VendorId): Promise<void> {
    const store = await this.storeRepository.findOpenedByOwner(id).get();
    store.closeAfterSales();
    await this.storeRepository.save(store);
  }

  @Post(':storeId/inspection/open')
  @UseGuards(VerifiedSuperAdminGuard)
  async open( @Param("storeId") storeId: string): Promise<void> {
    const store = await this.storeRepository.findById(new StoreId(storeId)).get();
    store.openAfterInspection();
    await this.storeRepository.save(store);
  }

  @Post(':storeId/inspection/close')
  @UseGuards(VerifiedSuperAdminGuard)
  async closeShop( @Param("storeId") storeId: string): Promise<void> {
    const store = await this.storeRepository.findById(new StoreId(storeId)).get();
    store.closeAfterInspection();
    await this.storeRepository.save(store);
  }

  @Post('food-cooking-space')
  @UseGuards(VerifiedVendorGuard)
  async createFoodCookingSpace(@AuthVendorId() id: VendorId, @Body() body: req.FoodCookingSpace) {
    const foodCookingSpace = new FoodCookingSpace();
    const store = await this.storeRepository.findOpenedByOwner(id).get();

    foodCookingSpace.create(store.getId(), body.foodName, body.getPricePerPlate());
    await this.foodCookingSpaceRepository.save(foodCookingSpace);
  }

  @Post('food-cooking-space/cook')
  @UseGuards(VerifiedVendorGuard)
  async cookPlatesOfFood(@AuthVendorId() id: VendorId, @Body() body: req.CookFood) {
    const store = await this.storeRepository.findOpenedByOwner(id).get();

    const foodCookingSpace = await this.foodCookingSpaceRepository
      .findByIdAndStoreId(body.getFoodCookingSpaceId(), store.getId())
      .get();

    foodCookingSpace.cookFood(body.noOfPlates);
    await this.foodCookingSpaceRepository.save(foodCookingSpace);
  }

}