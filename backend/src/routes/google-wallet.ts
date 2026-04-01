import { Router, Request, Response } from 'express';
import { generateGooglePassUrl } from '../services/google-wallet';
import { param } from '../utils/params';

export const googleWalletRouter = Router();

googleWalletRouter.get('/:serial', async (req: Request, res: Response) => {
  try {
    const serial = param(req.params.serial);
    const url = await generateGooglePassUrl(serial);
    res.json({ url });
  } catch (error: any) {
    console.error('Google pass generation error:', error);
    res.status(error.message?.includes('non configurés') ? 503 : 500).json({ error: error.message });
  }
});
