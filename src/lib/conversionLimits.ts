export const GUEST_CONVERSION_LIMIT = 3;
export const AUTHENTICATED_CONVERSION_LIMIT = null;

export function getGuestConversionsRemaining(historyCount: number) {
  return Math.max(0, GUEST_CONVERSION_LIMIT - historyCount);
}

export function hasReachedGuestConversionLimit(historyCount: number) {
  return historyCount >= GUEST_CONVERSION_LIMIT;
}
