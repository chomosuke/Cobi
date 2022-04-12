import { PrismaClient } from '../prisma/index';

export interface Context {
    prisma: PrismaClient;
    authUrl: string;
}
