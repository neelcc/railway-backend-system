import { app } from "./app.js";
import { Config } from "./config/index.js";
import { connectProducer, disconnectProducer } from "./config/kafka.js";
import logger from "./config/logger.js";


const startServer = async () => {
    const PORT = Config.PORT;
    try {
        // logger.info("Database Connected Successfully!");
        await connectProducer();
        const server = app.listen(PORT, () => {
            logger.info("Server is running on port " + PORT);
        });
        // Graceful shutdown
          const shutdown = async () => {
               logger.info('Shutting down gracefully...');
                await disconnectProducer(); 
               server.close(async () => {
                    logger.info('Server closed');
                    process.exit(0);
               });
          };
          
          process.on('SIGTERM', shutdown);
          process.on('SIGINT', shutdown);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

startServer().catch((error) => {
    logger.error("Failed to start server", error);
    process.exit(1);
});
