import express from "express";
import { SearchController } from "../controllers/searchController";
import { SearchService } from "../services/searchServices";
import logger from "../config/logger";

const router = express.Router();
const searchService = new SearchService();
const searchController = new SearchController(searchService,logger); ;
