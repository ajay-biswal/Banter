const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export function getApiBaseUrl(): string {
  if (!configuredBaseUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not configured. Add it to apps/mobile/.env.local and restart Expo.',
    );
  }

  return configuredBaseUrl.replace(/\/+$/, '');
}
