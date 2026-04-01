import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

export const restaurantRouter = Router();

restaurantRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.restaurantId },
      select: { id: true, name: true, email: true, logo: true, address: true, phone: true, createdAt: true },
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant non trouvé' });
      return;
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

restaurantRouter.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, phone, logo } = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id: req.restaurantId },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(logo !== undefined && { logo }),
      },
      select: { id: true, name: true, email: true, logo: true, address: true, phone: true },
    });

    res.json(restaurant);
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

restaurantRouter.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const programs = await prisma.loyaltyProgram.findMany({
      where: { restaurantId: req.restaurantId },
      include: {
        _count: { select: { cards: true } },
        cards: {
          include: { _count: { select: { transactions: true } } },
        },
      },
    });

    const totalCards = programs.reduce((sum, p) => sum + p._count.cards, 0);
    const totalTransactions = programs.reduce(
      (sum, p) => sum + p.cards.reduce((s, c) => s + c._count.transactions, 0),
      0
    );
    const totalRewards = programs.reduce(
      (sum, p) => sum + p.cards.reduce((s, c) => s + c.totalRewardsEarned, 0),
      0
    );

    res.json({
      totalPrograms: programs.length,
      totalCards,
      totalTransactions,
      totalRewards,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
