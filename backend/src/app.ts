import cors from 'cors';
import express, { json } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error';
import { requestIdMiddleware } from './middleware/requestId';
import authRoutes from './modules/auth/auth.routes';
import profilesRoutes from './modules/profiles/profiles.routes';
import reportsRoutes from './modules/reports/reports.routes';
import vitalsRoutes from './modules/vitals/vitals.routes';
import medicationsRoutes from './modules/medications/medications.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Request ID middleware
app.use(requestIdMiddleware);

// Body parsing (NEVER log request body - PHI risk)
app.use(json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profiles', profilesRoutes);
app.use('/api/v1/profiles', reportsRoutes);
app.use('/api/v1/profiles', vitalsRoutes);
app.use('/api/v1/profiles', medicationsRoutes);
app.use('/api/v1/appointments', appointmentsRoutes);

// Fake upload endpoint (must be before error handler, no auth required)
// Use regex to match any path after /fake-upload/
app.put(/^\/fake-upload\/(.+)$/, async (req, res) => {
  const fileKey = req.params[0]; // First capture group
  const chunks: Buffer[] = [];

  req.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    const { reportsService } = require('./modules/reports/reports.service');
    const data = Buffer.concat(chunks);
    reportsService.storeUploadedFile(fileKey, data);
    res.status(200).json({ message: 'File uploaded successfully' });
  });

  req.on('error', () => {
    res.status(500).json({ error: { code: 'UPLOAD_ERROR', message: 'Upload failed' } });
  });
});

// Fake view endpoint (no auth required)
app.get(/^\/fake-view\/(.+)$/, (req, res) => {
  const { getFile } = require('./modules/reports/reports.service');
  const fileKey = req.params[0]; // First capture group
  const data = getFile(fileKey);

  if (!data) {
    return res.status(404).json({ error: { code: 'FILE_NOT_FOUND', message: 'File not found' } });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.send(data);
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;

