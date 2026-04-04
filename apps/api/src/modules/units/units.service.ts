import { prisma } from '../../shared/db/prisma.js';

const DEFAULT_UNITS = [
  { code: 'un', name: 'Unidade' },
  { code: 'kg', name: 'Quilograma' },
  { code: 'g', name: 'Grama' },
  { code: 'l', name: 'Litro' },
  { code: 'ml', name: 'Mililitro' },
];

export async function seedDefaultUnits() {
  for (const u of DEFAULT_UNITS) {
    await prisma.unit.upsert({
      where: { code: u.code },
      update: { name: u.name },
      create: { code: u.code, name: u.name },
    });
  }
}

export async function listUnits() {
  return prisma.unit.findMany({ orderBy: { code: 'asc' } });
}
