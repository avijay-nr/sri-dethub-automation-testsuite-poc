import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { config as config_SRIGenericTest } from './config_SRIGenericTest';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];

const resolvedEnvPath = envCandidates.find((candidate) => existsSync(candidate));

if (resolvedEnvPath) {
  dotenv.config({ path: resolvedEnvPath });
} else {
  dotenv.config();
}

const configMap = {
  config_SRIGenericTest,
} as const;

type ConfigKey = keyof typeof configMap;

const selectedConfig = (((globalThis as any).process?.env?.TEST_CONFIG as string | undefined) || 'config_SRIGenericTest') as ConfigKey;

if (!(selectedConfig in configMap)) {
  throw new Error(
    `Invalid TEST_CONFIG: "${selectedConfig}". Use one of: ${Object.keys(configMap).join(', ')}`
  );
}

export const config = configMap[selectedConfig];

export const envDiagnostics = {
  cwd: process.cwd(),
  envPath: resolvedEnvPath ?? '(not found)',
  hasUsername: Boolean(process.env.DETHUB_USERNAME),
  hasPassword: Boolean(process.env.DETHUB_PASSWORD),
};
