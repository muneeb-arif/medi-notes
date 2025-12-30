import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { appointmentsController } from './appointments.controller';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /profiles/{profileId}/appointments:
 *   post:
 *     summary: Create appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startAt
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               specialty:
 *                 type: string
 *               doctorName:
 *                 type: string
 *               facility:
 *                 type: string
 *               location:
 *                 type: string
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               endAt:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 */
router.post('/', appointmentsController.create);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: List appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profileId
 *         schema:
 *           type: string
 *         description: Optional profile ID to filter appointments
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Error'
 */
router.get('/', appointmentsController.list);

/**
 * @swagger
 * /appointments/{appointmentId}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.get('/:appointmentId', appointmentsController.getById);

/**
 * @swagger
 * /appointments/{appointmentId}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               specialty:
 *                 type: string
 *               doctorName:
 *                 type: string
 *               facility:
 *                 type: string
 *               location:
 *                 type: string
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               endAt:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         $ref: '#/components/responses/Error'
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.put('/:appointmentId', appointmentsController.update);

/**
 * @swagger
 * /appointments/{appointmentId}:
 *   delete:
 *     summary: Delete appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       401:
 *         $ref: '#/components/responses/Error'
 *       404:
 *         $ref: '#/components/responses/Error'
 */
router.delete('/:appointmentId', appointmentsController.delete);

export default router;

