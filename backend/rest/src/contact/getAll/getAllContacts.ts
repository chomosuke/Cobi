import { PrismaClient } from '../../../prisma';

export async function getAllContacts(prisma: PrismaClient, userId: number) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            contacts1: {
                select: {
                    userId2: true,
                },
            },
            contacts2: {
                select: {
                    userId1: true,
                },
            },
        },
        rejectOnNotFound: true,
    });
    const contacts1 = user.contacts1.map((c) => c.userId2);
    const contacts2 = user.contacts2.map((c) => c.userId1);
    const contacts = contacts2.concat(contacts1);
    return contacts;
}
