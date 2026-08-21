import { Logger } from "winston";
import { InventoryService } from "../services/inventoryService";

export class InventoryController {

    constructor(
        private  inventoryService: InventoryService,
        private  logger: Logger
    ) {}

}