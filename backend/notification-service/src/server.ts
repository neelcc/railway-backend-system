import { app } from "./app.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";
import { emailConsumer } from "./kafka/consumer/emailConsumer.js";


const startServer = async () => {
    try {
    logger.info('Starting Notification Service...');
        emailConsumer.start();
    logger.info('✅ Notification Service started successfully');
    
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (reason, promise) => {
     logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
     logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
     process.exit(1);
});

startServer().catch((error) => {
    logger.error("Failed to start server", error);
    process.exit(1);
});
