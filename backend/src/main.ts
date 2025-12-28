import 'dotenv/config';
import 'reflect-metadata';
import app from './app';
import { config } from './config/env';
import { AppDataSource } from './database/data-source';

const startServer = async () => {
  try {
    // Initialize database connection
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`API base URL: ${config.apiBaseUrl}`);
    });

    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
          console.log('Database connection closed');
        }
        console.log('Process terminated');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

