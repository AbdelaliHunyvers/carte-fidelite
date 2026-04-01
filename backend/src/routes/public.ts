import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { config } from '../config';
import { param } from '../utils/params';
import { certsExist as appleCertsExist } from '../services/apple-wallet';
import { credentialsExist as googleCredsExist } from '../services/google-wallet';

export const publicRouter = Router();

publicRouter.get('/programs/:id', async (req: Request, res: Response) => {
  try {
    const id = param(req.params.id);
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id },
      include: {
        restaurant: { select: { name: true, logo: true, address: true } },
      },
    });

    if (!program || !program.isActive) {
      res.status(404).json({ error: 'Programme non trouvé' });
      return;
    }

    res.json({
      id: program.id,
      name: program.name,
      description: program.description,
      type: program.type,
      stampGoal: program.stampGoal,
      pointsGoal: program.pointsGoal,
      pointsPerEuro: program.pointsPerEuro,
      reward: program.reward,
      color: program.color,
      restaurant: program.restaurant,
    });
  } catch (error) {
    console.error('Public program error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

publicRouter.post('/register/:programId', async (req: Request, res: Response) => {
  try {
    const programId = param(req.params.programId);
    const { email, name, phone } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email requis' });
      return;
    }

    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
      include: { restaurant: { select: { name: true } } },
    });

    if (!program || !program.isActive) {
      res.status(404).json({ error: 'Programme non trouvé ou inactif' });
      return;
    }

    let customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      customer = await prisma.customer.create({ data: { email, name, phone } });
    }

    const existingCard = await prisma.loyaltyCard.findUnique({
      where: { customerId_programId: { customerId: customer.id, programId: program.id } },
    });

    const appleAvailable = appleCertsExist();
    const googleAvailable = googleCredsExist();

    if (existingCard) {
      res.json({
        message: 'Carte existante',
        card: { serialNumber: existingCard.serialNumber },
        applePassUrl: appleAvailable ? `${config.apiBaseUrl}/api/passes/apple/${existingCard.serialNumber}` : null,
        googlePassUrl: googleAvailable ? `${config.apiBaseUrl}/api/passes/google/${existingCard.serialNumber}` : null,
      });
      return;
    }

    const card = await prisma.loyaltyCard.create({
      data: {
        customerId: customer.id,
        programId: program.id,
      },
    });

    res.status(201).json({
      message: 'Carte créée',
      card: { serialNumber: card.serialNumber },
      applePassUrl: appleAvailable ? `${config.apiBaseUrl}/api/passes/apple/${card.serialNumber}` : null,
      googlePassUrl: googleAvailable ? `${config.apiBaseUrl}/api/passes/google/${card.serialNumber}` : null,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
