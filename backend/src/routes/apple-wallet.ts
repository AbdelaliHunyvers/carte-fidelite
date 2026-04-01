import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { generateApplePass } from '../services/apple-wallet';
import { config } from '../config';
import { param } from '../utils/params';

export const appleWalletRouter = Router();

appleWalletRouter.get('/:serial', async (req: Request, res: Response) => {
  try {
    const serial = param(req.params.serial);
    const passBuffer = await generateApplePass(serial);
    res.set({
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Disposition': `attachment; filename=loyalty-${serial}.pkpass`,
    });
    res.send(passBuffer);
  } catch (error: any) {
    console.error('Apple pass generation error:', error);
    res.status(error.message?.includes('non configurés') ? 503 : 500).json({ error: error.message });
  }
});

appleWalletRouter.post(
  '/devices/:deviceId/registrations/:passTypeId/:serial',
  async (req: Request, res: Response) => {
    try {
      const deviceId = param(req.params.deviceId);
      const serial = param(req.params.serial);
      const { pushToken } = req.body;

      const authToken = req.headers.authorization?.replace('ApplePass ', '');
      if (authToken !== serial) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await prisma.applePassRegistration.upsert({
        where: { deviceId_serialNumber: { deviceId, serialNumber: serial } },
        create: {
          deviceId,
          pushToken,
          serialNumber: serial,
          passTypeId: config.apple.passTypeId,
        },
        update: { pushToken },
      });

      res.status(201).send();
    } catch (error) {
      console.error('Apple register device error:', error);
      res.status(500).send();
    }
  }
);

appleWalletRouter.get(
  '/devices/:deviceId/registrations/:passTypeId',
  async (req: Request, res: Response) => {
    try {
      const deviceId = param(req.params.deviceId);
      const passTypeId = param(req.params.passTypeId);
      const passesUpdatedSince = typeof req.query.passesUpdatedSince === 'string'
        ? req.query.passesUpdatedSince
        : undefined;

      const registrations = await prisma.applePassRegistration.findMany({
        where: { deviceId, passTypeId },
      });

      if (registrations.length === 0) {
        res.status(204).send();
        return;
      }

      const serialNumbers = registrations.map((r) => r.serialNumber);

      let cards;
      if (passesUpdatedSince) {
        cards = await prisma.loyaltyCard.findMany({
          where: {
            serialNumber: { in: serialNumbers },
            lastUpdated: { gt: new Date(passesUpdatedSince) },
          },
        });
      } else {
        cards = await prisma.loyaltyCard.findMany({
          where: { serialNumber: { in: serialNumbers } },
        });
      }

      if (cards.length === 0) {
        res.status(204).send();
        return;
      }

      res.json({
        serialNumbers: cards.map((c) => c.serialNumber),
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Apple get serials error:', error);
      res.status(500).send();
    }
  }
);

appleWalletRouter.get(
  '/passes/:passTypeId/:serial',
  async (req: Request, res: Response) => {
    try {
      const serial = param(req.params.serial);
      const passBuffer = await generateApplePass(serial);
      res.set({ 'Content-Type': 'application/vnd.apple.pkpass' });
      res.send(passBuffer);
    } catch (error) {
      console.error('Apple get pass error:', error);
      res.status(500).send();
    }
  }
);

appleWalletRouter.delete(
  '/devices/:deviceId/registrations/:passTypeId/:serial',
  async (req: Request, res: Response) => {
    try {
      const deviceId = param(req.params.deviceId);
      const serial = param(req.params.serial);

      await prisma.applePassRegistration.deleteMany({
        where: { deviceId, serialNumber: serial },
      });

      res.status(200).send();
    } catch (error) {
      console.error('Apple unregister error:', error);
      res.status(500).send();
    }
  }
);

appleWalletRouter.post('/log', (req: Request, res: Response) => {
  console.log('Apple Wallet log:', JSON.stringify(req.body));
  res.status(200).send();
});
