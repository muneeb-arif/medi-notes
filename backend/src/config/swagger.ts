import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medi Note API',
      version: '1.0.0',
      description: 'API documentation for Medi Note healthcare mobile application',
      contact: {
        name: 'Medi Note',
      },
    },
    servers: [
      {
        url: `${config.apiBaseUrl}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        Error: {
          description: 'Error response',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                requestId: { type: 'string' },
              },
            },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'acc_123' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'Primary User' },
            settings: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                timezone: { type: 'string', example: 'Asia/Karachi' },
                notificationPreferences: {
                  type: 'object',
                  properties: {
                    appointments: { type: 'boolean' },
                    medications: { type: 'boolean' },
                    reports: { type: 'boolean' },
                    security: { type: 'boolean' },
                  },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        PersonProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'prof_123' },
            accountId: { type: 'string' },
            fullName: { type: 'string', example: 'Sarah Ahmad' },
            dateOfBirth: { type: 'string', format: 'date', example: '1980-01-01' },
            gender: { type: 'string', example: 'female' },
            relationToAccount: { type: 'string', example: 'self' },
            bloodType: { type: 'string', example: 'O+' },
            heightCm: { type: 'number', example: 164 },
            weightKg: { type: 'number', example: 68 },
            allergies: { type: 'array', items: { type: 'string' } },
            chronicConditions: { type: 'array', items: { type: 'string' } },
            emergencyContacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  relation: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
            emergencyAccessEnabled: { type: 'boolean' },
            doctorSharingEnabled: { type: 'boolean' },
            photoUrl: { type: 'string', nullable: true },
            lastUpdatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'rep_123' },
            personProfileId: { type: 'string' },
            conditionProfileId: { type: 'string' },
            title: { type: 'string', example: 'CBC Lab Report' },
            reportDate: { type: 'string', format: 'date', example: '2025-07-15' },
            type: {
              type: 'string',
              enum: ['lab', 'radiology', 'prescription', 'visit_note', 'discharge', 'other'],
            },
            doctorName: { type: 'string' },
            facility: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            fileUrl: { type: 'string' },
            fileType: { type: 'string' },
            includeInEmergency: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/**/*.routes.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

