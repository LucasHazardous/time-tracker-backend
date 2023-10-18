import { PrismaClient } from '@prisma/client';

console.log("connected to database");
const prisma = new PrismaClient();

export default prisma;