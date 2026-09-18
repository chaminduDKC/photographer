import { prisma } from '../../config/prisma';

const SINGLETON_ID = 'business-info-singleton';

export async function getBusinessInfo() {
  return prisma.businessInfo.findFirst();
}

export async function upsertBusinessInfo(data: {
  phone1: string;
  phone2?: string;
  whatsapp?: string;
  address: string;
  city: string;
  province: string;
}) {
  return prisma.businessInfo.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
}
