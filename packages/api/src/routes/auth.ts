import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { config } from '../config';
import { getUserByPhone, createUser } from '@artisan/db';

const router = Router();

const otpStore = new Map<string, { otp: string; expiresAt: number; phone: string }>();

router.post('/request-otp', (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({ error: 'Phone number required' });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpId = uuid();
  const expiresAt = Date.now() + config.otpExpiryMinutes * 60 * 1000;

  otpStore.set(otpId, { otp, expiresAt, phone });

  console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);

  res.json({ otpId, message: 'OTP sent successfully' });
});

router.post('/verify-otp', (req: Request, res: Response) => {
  const { otpId, otp } = req.body;

  if (!otpId || !otp) {
    res.status(400).json({ error: 'OTP ID and code required' });
    return;
  }

  const stored = otpStore.get(otpId);

  if (!stored) {
    res.status(400).json({ error: 'Invalid OTP ID' });
    return;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(otpId);
    res.status(400).json({ error: 'OTP expired' });
    return;
  }

  if (stored.otp !== otp) {
    res.status(400).json({ error: 'Invalid OTP' });
    return;
  }

  otpStore.delete(otpId);

  let user = getUserByPhone(stored.phone);

  if (!user) {
    user = createUser({
      name: 'New Artisan',
      phone: stored.phone,
      craft: 'other',
      lat: 0,
      lng: 0,
      district: '',
      state: '',
    });
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  res.json({ token, user });
});

export { router as authRoutes };
