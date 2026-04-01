import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { param } from '../utils/params';

export const programRouter = Router();

programRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, name, description, stampGoal, pointsPerEuro, pointsGoal, reward, color } = req.body;

    if (!type || !name || !reward) {
      res.status(400).json({ error: 'Type, nom et récompense requis' });
      return;
    }

    if (type === 'STAMPS' && !stampGoal) {
      res.status(400).json({ error: 'Nombre de tampons requis pour un programme tampons' });
      return;
    }

    if (type === 'POINTS' && (!pointsPerEuro || !pointsGoal)) {
      res.status(400).json({ error: 'Points par euro et objectif requis pour un programme points' });
      return;
    }

    const program = await prisma.loyaltyProgram.create({
      data: {
        restaurantId: req.restaurantId!,
        type,
        name,
        description,
        stampGoal: type === 'STAMPS' ? stampGoal : null,
        pointsPerEuro: type === 'POINTS' ? pointsPerEuro : null,
        pointsGoal: type === 'POINTS' ? pointsGoal : null,
        reward,
        color: color || '#1a1a2e',
      },
    });

    res.status(201).json(program);
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

programRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const programs = await prisma.loyaltyProgram.findMany({
      where: { restaurantId: req.restaurantId },
      include: { _count: { select: { cards: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(programs);
  } catch (error) {
    console.error('List programs error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

programRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = param(req.params.id);
    const program = await prisma.loyaltyProgram.findFirst({
      where: { id, restaurantId: req.restaurantId },
      include: {
        _count: { select: { cards: true } },
        cards: {
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!program) {
      res.status(404).json({ error: 'Programme non trouvé' });
      return;
    }

    res.json(program);
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

programRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = param(req.params.id);
    const existing = await prisma.loyaltyProgram.findFirst({
      where: { id, restaurantId: req.restaurantId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Programme non trouvé' });
      return;
    }

    const { name, description, reward, color, isActive } = req.body;

    const program = await prisma.loyaltyProgram.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(reward && { reward }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(program);
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

programRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = param(req.params.id);
    const existing = await prisma.loyaltyProgram.findFirst({
      where: { id, restaurantId: req.restaurantId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Programme non trouvé' });
      return;
    }

    await prisma.loyaltyProgram.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
