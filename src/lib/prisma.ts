import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global prisma client to ensure single instance in dev mode
  // This prevents performance degradation from multiple instances.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use global prisma client if it exists (for dev), else create a new one (for prod)
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
