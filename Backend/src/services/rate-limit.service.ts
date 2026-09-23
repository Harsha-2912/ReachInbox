import { redis } from '../config/redis';
import { env } from '../config/env';

export const rateLimitService = {
  /**
   * Checks and increments the rate limit for a sender in the current hour window.
   * Returns true if allowed, false if rate limited.
   */
  async checkHourlyLimit(senderId: string, limit: number = env.MAX_EMAILS_PER_HOUR): Promise<boolean> {
    const currentHour = new Date().toISOString().slice(0, 13); // e.g., '2026-09-23T11'
    const key = `email-rate:${senderId}:${currentHour}`;

    const luaScript = `
      var count = redis.call('GET', KEYS[1])
      if not count then
        redis.call('SET', KEYS[1], 1, 'EX', 3600)
        return 1
      end
      if tonumber(count) >= tonumber(ARGV[1]) then
        return 0
      else
        redis.call('INCR', KEYS[1])
        return 1
      end
    `;

    const result = await redis.eval(luaScript, 1, key, limit.toString());
    return result === 1;
  },

  /**
   * Reserves a time slot enforcing the minimum delay between emails for a sender.
   * Returns true if successfully reserved the current moment (i.e. we have waited long enough).
   * If it returns false, it returns the minimum timestamp we should wait for.
   */
  async enforceMinimumDelay(senderId: string): Promise<{ allowed: boolean; waitTimeMs?: number }> {
    const key = `sender-next-send:${senderId}`;
    const now = Date.now();
    const delay = env.MIN_EMAIL_DELAY_MS;

    const luaScript = `
      var nextSend = redis.call('GET', KEYS[1])
      if not nextSend or tonumber(nextSend) <= tonumber(ARGV[1]) then
        -- Allowed to send now. Set the next allowed time
        redis.call('SET', KEYS[1], tonumber(ARGV[1]) + tonumber(ARGV[2]))
        return { 1, 0 }
      else
        -- Need to wait
        return { 0, tonumber(nextSend) - tonumber(ARGV[1]) }
      end
    `;

    const result: any = await redis.eval(luaScript, 1, key, now.toString(), delay.toString());
    const allowed = result[0] === 1;
    const waitTimeMs = result[1];

    return { allowed, waitTimeMs: waitTimeMs > 0 ? waitTimeMs : undefined };
  }
};
