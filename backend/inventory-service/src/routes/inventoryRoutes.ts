import express from 'express';
import { InventoryService } from '../services/inventoryService';
import logger from '../config/logger';
import { InventoryController } from '../controllers/inventoryController';


export const router = express.Router();
const inventoryService = new InventoryService();
const inventoryController = new InventoryController(inventoryService, logger);
