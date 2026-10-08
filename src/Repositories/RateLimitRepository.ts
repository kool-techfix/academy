import { prisma } from "@/lib/prisma";

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window frees up (null when allowed). */
  retryAfter: number | null;
};

export class RateLimitRepository {
  /**
   * Record one request against `key` and report whether it's within `max`
   * requests per `windowSeconds`. A single atomic upsert, so concurrent
   * requests on different serverless instances can't slip past the limit.
   */
  async consume(
    key: string,
    windowSeconds: number,
    max: number,
  ): Promise<RateLimitResult> {
    const rows = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
      INSERT INTO "RateLimit" ("key", "count", "windowStart")
      VALUES (${key}, 1, (now() AT TIME ZONE 'UTC'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."windowStart" <= (now() AT TIME ZONE 'UTC') - make_interval(secs => ${windowSeconds}::double precision)
            THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "windowStart" = CASE
          WHEN "RateLimit"."windowStart" <= (now() AT TIME ZONE 'UTC') - make_interval(secs => ${windowSeconds}::double precision)
            THEN (now() AT TIME ZONE 'UTC')
          ELSE "RateLimit"."windowStart"
        END
      RETURNING "count", "windowStart"
    `;

    // Occasionally sweep counters whose windows ended long ago.
    if (Math.random() < 0.01) {
      await prisma.rateLimit.deleteMany({
        where: { windowStart: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      });
    }

    const { count, windowStart } = rows[0];

    if (Number(count) <= max) {
      return { allowed: true, retryAfter: null };
    }

    const resetsAt = windowStart.getTime() + windowSeconds * 1000;

    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((resetsAt - Date.now()) / 1000)),
    };
  }
}
