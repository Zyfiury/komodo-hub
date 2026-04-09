import { prisma } from "@/lib/prisma";

export async function audit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata: JSON.stringify(metadata ?? {}),
    },
  });
}
