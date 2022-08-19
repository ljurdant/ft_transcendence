"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const room = await prisma.room.findUnique({
        where: {
            id: 1,
        },
    });
    if (!room) {
        await prisma.room.create({
            data: {
                name: 'general',
                ownerId: 60040,
                visibility: 'public',
                password: '',
            },
        });
    }
}
main();
//# sourceMappingURL=seed.js.map