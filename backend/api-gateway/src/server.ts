import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middlewares/cors';
import { Config } from './config';
import logger from './config/logger';
import { router } from './routes';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// app.use(reqLogger);

app.use(cookieParser());



app.get('/health', (req, res) => {
     res.status(200).json({
          success: true,
          message: 'API Gateway is running',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
     });
});

app.use('/api/v1', router);

app.use(globalErrorHandler)


// app.use(notFound);
// app.use(errorHandler);

const gracefulShutdown = () => {
     logger.info('Received shutdown signal, closing server gracefully...');
     server.close(() => {
          logger.info('Server closed');
          process.exit(0);
     });

     setTimeout(() => {
          logger.error('Forced shutdown after timeout');
          process.exit(1);
     }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const server = app.listen(Config.PORT, () => {
     logger.info(`🚀 API Gateway running on port ${Config.PORT} in ${Config.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
     logger.error('Unhandled Rejection:', err);
     server.close(() => process.exit(1));
});

module.exports = app;