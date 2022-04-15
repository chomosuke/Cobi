import { PrismaClient } from '../../../prisma';

export async function searchDB(prisma: PrismaClient, username: string) {
    return (await prisma.users.findMany({
        select: {
            id: true,
        },
        where: {
            username: {
                contains: username,
                mode: 'insensitive',
            },
        },
    })).map((r) => r.id);
}
