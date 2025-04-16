import { RateLimiter } from 'limiter';

interface TokenBucket {
  removeTokens(count: number): Promise<number>;
}

export const createRateLimiter = (): TokenBucket => {
  return new RateLimiter({
    tokensPerInterval: 30,
    interval: 'minute',
    fireImmediately: true
  });
};

export const checkRateLimit = async (limiter: TokenBucket): Promise<number> => {
  const remainingRequests = await limiter.removeTokens(1);
  if (remainingRequests < 0) {
    throw new Error('Rate limit exceeded');
  }
  return remainingRequests;
};
