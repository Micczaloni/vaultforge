import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { xpReward: "desc" },
    });
    return jsonOk(achievements);
  } catch (error) {
    console.error(error);
    return jsonError(500, "INTERNAL_ERROR", "Failed to load achievements");
  }
}
