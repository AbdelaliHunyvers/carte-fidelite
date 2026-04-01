import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db';
import { config } from '../config';

function certsExist(): boolean {
  return (
    fs.existsSync(config.apple.wwdrCertPath) &&
    fs.existsSync(config.apple.signerCertPath) &&
    fs.existsSync(config.apple.signerKeyPath)
  );
}

function buildStampLabel(current: number, goal: number): string {
  const filled = '●';
  const empty = '○';
  const stamps = [];
  for (let i = 0; i < goal; i++) {
    stamps.push(i < current ? filled : empty);
  }
  return stamps.join(' ');
}

export async function generateApplePass(serialNumber: string): Promise<Buffer> {
  if (!certsExist()) {
    throw new Error('Certificats Apple non configurés. Consultez le README pour les instructions.');
  }

  const card = await prisma.loyaltyCard.findUnique({
    where: { serialNumber },
    include: {
      customer: true,
      program: { include: { restaurant: true } },
    },
  });

  if (!card) throw new Error('Carte non trouvée');

  const wwdr = fs.readFileSync(config.apple.wwdrCertPath);
  const signerCert = fs.readFileSync(config.apple.signerCertPath);
  const signerKey = fs.readFileSync(config.apple.signerKeyPath);

  const pass = new PKPass(
    {},
    {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase: config.apple.signerKeyPassphrase,
    },
    {
      serialNumber: card.serialNumber,
      passTypeIdentifier: config.apple.passTypeId,
      teamIdentifier: config.apple.teamId,
      organizationName: card.program.restaurant.name,
      description: `Carte de fidélité - ${card.program.restaurant.name}`,
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: card.program.color,
      logoText: card.program.restaurant.name,
      webServiceURL: `${config.apiBaseUrl}/api/v1`,
      authenticationToken: card.serialNumber,
    }
  );

  pass.type = 'storeCard';

  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: card.serialNumber,
    messageEncoding: 'iso-8859-1',
  });

  if (card.program.type === 'STAMPS') {
    pass.headerFields.push({
      key: 'stamps',
      label: 'TAMPONS',
      value: `${card.currentStamps}/${card.program.stampGoal}`,
    });
    pass.secondaryFields.push({
      key: 'progress',
      label: 'PROGRESSION',
      value: buildStampLabel(card.currentStamps, card.program.stampGoal!),
    });
  } else {
    pass.headerFields.push({
      key: 'points',
      label: 'POINTS',
      value: `${card.currentPoints}`,
    });
    pass.secondaryFields.push({
      key: 'goal',
      label: 'OBJECTIF',
      value: `${card.currentPoints}/${card.program.pointsGoal} points`,
    });
  }

  pass.auxiliaryFields.push({
    key: 'reward',
    label: 'RÉCOMPENSE',
    value: card.program.reward,
  });

  if (card.customer.name) {
    pass.auxiliaryFields.push({
      key: 'member',
      label: 'MEMBRE',
      value: card.customer.name,
    });
  }

  pass.backFields.push(
    {
      key: 'program',
      label: 'Programme',
      value: card.program.name,
    },
    {
      key: 'rewards',
      label: 'Récompenses obtenues',
      value: `${card.totalRewardsEarned}`,
    }
  );

  // Load logo if restaurant has one stored locally
  const defaultLogoPath = path.resolve(__dirname, '../../passes/templates/logo.png');
  if (fs.existsSync(defaultLogoPath)) {
    pass.addBuffer('logo.png', fs.readFileSync(defaultLogoPath));
    pass.addBuffer('logo@2x.png', fs.readFileSync(defaultLogoPath));
  }

  const iconPath = path.resolve(__dirname, '../../passes/templates/icon.png');
  if (fs.existsSync(iconPath)) {
    pass.addBuffer('icon.png', fs.readFileSync(iconPath));
    pass.addBuffer('icon@2x.png', fs.readFileSync(iconPath));
  }

  const buffer = pass.getAsBuffer();
  return buffer;
}

export async function updateApplePass(serialNumber: string): Promise<void> {
  // Find all registered devices for this pass and send push notifications
  const registrations = await prisma.applePassRegistration.findMany({
    where: { serialNumber },
  });

  if (registrations.length === 0) return;
  if (!certsExist()) return;

  // APNs push notifications would go here
  // In production, use the `apn` library to send silent push notifications
  // to each registered device, which triggers iOS to re-fetch the pass
  console.log(`Would send APNs push to ${registrations.length} device(s) for pass ${serialNumber}`);
}
