import {
  RateLimitRepository,
  type RateLimitResult,
} from "@/Repositories/RateLimitRepository";

export type RateLimitRule = {
  /** Distinct key, e.g. `login:email:someone@example.com`. */
  key: string;
  windowSeconds: number;
  max: number;
};

/** Limits for the app's own auth routes (Better Auth has its own rules). */
export const AUTH_RATE_LIMITS = {
  loginPerIp: { windowSeconds: 10 * 60, max: 30 },
  loginPerEmail: { windowSeconds: 15 * 60, max: 10 },
  registerPerIp: { windowSeconds: 60 * 60, max: 10 },
  /** Current-password checks when changing email/password in settings. */
  accountChangePerUser: { windowSeconds: 15 * 60, max: 5 },
} as const;

export class RateLimitService {
  constructor(private readonly repository = new RateLimitRepository()) {}

  consume(key: string, windowSeconds: number, max: number) {
    return this.repository.consume(key, windowSeconds, max);
  }

  /**
   * Check several limits; returns the first that's exceeded, or null.
   * Every rule is counted, so a blocked caller keeps using up its budget.
   */
  async check(rules: RateLimitRule[]): Promise<RateLimitResult | null> {
    let blocked: RateLimitResult | null = null;

    for (const rule of rules) {
      const result = await this.consume(rule.key, rule.windowSeconds, rule.max);

      if (!result.allowed && !blocked) {
        blocked = result;
      }
    }

    return blocked;
  }
}
