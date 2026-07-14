import { loadEnv } from 'vite';

export function resolveViteSiteUrl(mode = process.env.MODE ?? 'production') {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const fromEnvFile = env.VITE_SITE_URL?.trim();
  const fromProcess = process.env.VITE_SITE_URL?.trim();

  return fromEnvFile || fromProcess;
}
