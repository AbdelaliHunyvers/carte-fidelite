import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, address, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Nom, email et mot de passe requis' });
      return;
    }

    const existing = await prisma.restaurant.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Un restaurant avec cet email existe déjà' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const restaurant = await prisma.restaurant.create({
      data: { name, email, password: hashedPassword, address, phone },
    });

    const token = jwt.sign({ restaurantId: restaurant.id }, config.jwtSecret, { expiresIn: '30d' });

    res.status(201).json({
      token,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        address: restaurant.address,
        phone: restaurant.phone,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis' });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { email } });
    if (!restaurant) {
      res.status(401).json({ error: 'Identifiants invalides' });
      return;
    }

    const validPassword = await bcrypt.compare(password, restaurant.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Identifiants invalides' });
      return;
    }

    const token = jwt.sign({ restaurantId: restaurant.id }, config.jwtSecret, { expiresIn: '30d' });

    res.json({
      token,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        address: restaurant.address,
        phone: restaurant.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
