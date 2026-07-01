import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { parseVoiceCommand } from '@artisan/voice';

const router = Router();

router.use(authenticate);

router.post('/transcribe', (req: AuthRequest, res: Response) => {
  const { transcript, language } = req.body;

  if (!transcript) {
    res.status(400).json({ error: 'Transcript required' });
    return;
  }

  const result = parseVoiceCommand(transcript, language || 'en');

  res.json(result);
});

export { router as voiceRoutes };
