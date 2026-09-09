#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROFILE_KEYS = [
  'NABU_PROFILE_VERSION',
  'NABU_API_BASE_URL',
  'NABU_SHARED_SPACE_ID',
  'NABU_ROOT_PATH',
  'NABU_PERMISSIONS',
  'NABU_ACCESS_TOKEN_EXPIRES_AT',
  'NABU_ACCESS_TOKEN',
];

function assertSafeValue(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing ${name}`);
  }
  if (/[\r\n\0]/u.test(value)) {
    throw new Error(`Unsafe ${name}`);
  }
  return value;
}

export function parseRedemptionResponse(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Redemption response must be an object');
  }
  const accessToken = assertSafeValue('accessToken', value.accessToken);
  const accessTokenExpiresAt = assertSafeValue(
    'accessTokenExpiresAt',
    value.accessTokenExpiresAt,
  );
  const sharedSpaceId = assertSafeValue('sharedSpaceId', value.sharedSpaceId);
  if (!/^space_[A-Za-z0-9-]+$/u.test(sharedSpaceId)) {
    throw new Error('Invalid sharedSpaceId');
  }
  const rootPath = assertSafeValue('rootPath', value.rootPath);
  if (rootPath.startsWith('/') || rootPath.includes('..')) {
    throw new Error('Invalid rootPath');
  }
  if (!Array.isArray(value.permissions) || value.permissions.length === 0) {
    throw new Error('Missing permissions');
  }
  const permissions = value.permissions.map((permission) =>
    assertSafeValue('permission', permission));
  if (permissions.some((permission) => !['read', 'write'].includes(permission))) {
    throw new Error('Invalid permission');
  }
  if (Number.isNaN(Date.parse(accessTokenExpiresAt))) {
    throw new Error('Invalid accessTokenExpiresAt');
  }
  return {
    accessToken,
    accessTokenExpiresAt,
    sharedSpaceId,
    rootPath,
    permissions,
    links: value.links && typeof value.links === 'object' ? value.links : {},
  };
}

export function canonicalizeApiBase(input) {
  const url = new URL(input);
  const loopback = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
    throw new Error('Nabu requires HTTPS outside loopback development');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Unsafe Nabu base URL');
  }
  url.pathname = url.pathname.replace(/\/+$/u, '');
  return url.toString().replace(/\/$/u, '');
}

export function apiBaseFromInvite(inviteUrl) {
  const url = new URL(inviteUrl);
  const match = url.pathname.match(/^(.*)\/invites\/[^/]+$/u);
  if (!match || url.search || url.hash || url.username || url.password) {
    throw new Error('Invalid Nabu invite URL');
  }
  url.pathname = match[1] || '/';
  return canonicalizeApiBase(url.toString());
}

export function deploymentHash(apiBaseUrl) {
  return `sha256-${crypto.createHash('sha256').update(apiBaseUrl).digest('hex')}`;
}

export function getProfilePath({
  credentialsRoot,
  deploymentHash: hash,
  sharedSpaceId,
  platform = process.platform,
}) {
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  return pathApi.join(credentialsRoot, hash, `${sharedSpaceId}.env`);
}

export function buildProfileContent({
  apiBaseUrl,
  sharedSpaceId,
  rootPath,
  permissions,
  accessTokenExpiresAt,
  accessToken,
}) {
  const fields = {
    NABU_PROFILE_VERSION: '2',
    NABU_API_BASE_URL: assertSafeValue('apiBaseUrl', apiBaseUrl),
    NABU_SHARED_SPACE_ID: assertSafeValue('sharedSpaceId', sharedSpaceId),
    NABU_ROOT_PATH: assertSafeValue('rootPath', rootPath),
    NABU_PERMISSIONS: permissions.join(','),
    NABU_ACCESS_TOKEN_EXPIRES_AT: assertSafeValue(
      'accessTokenExpiresAt',
      accessTokenExpiresAt,
    ),
    NABU_ACCESS_TOKEN: assertSafeValue('accessToken', accessToken),
  };
  return `${PROFILE_KEYS.map((key) => `${key}=${fields[key]}`).join('\n')}\n`;
}

export function getWindowsAclCommands({ directoryPath, filePath, sid }) {
  assertSafeValue('Windows SID', sid);
  return [
    {
      command: 'icacls.exe',
      args: [
        directoryPath,
        '/inheritance:r',
        '/grant:r',
        `*${sid}:(OI)(CI)F`,
      ],
    },
    {
      command: 'icacls.exe',
      args: [filePath, '/inheritance:r', '/grant:r', `*${sid}:F`],
    },
  ];
}

function parseArgs(argv) {
  const options = {
    mode: 'invite',
    replace: false,
    credentialsDir: process.env.NABU_CREDENTIALS_DIR || '',
    apiBaseUrl: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--response-stdin') options.mode = 'response';
    else if (argument === '--invite-stdin') options.mode = 'invite';
    else if (argument === '--replace') options.replace = true;
    else if (argument === '--credentials-dir') options.credentialsDir = argv[++index] || '';
    else if (argument === '--api-base') options.apiBaseUrl = argv[++index] || '';
    else if (argument === '--help') options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

function defaultCredentialsRoot(platform = process.platform) {
  if (process.env.NABU_CREDENTIALS_DIR) return process.env.NABU_CREDENTIALS_DIR;
  if (process.env.CODEX_HOME) return path.join(process.env.CODEX_HOME, 'secrets', 'nabu');
  const home = os.homedir();
  const codexRoot = path.join(home, '.codex');
  if (fs.existsSync(codexRoot)) return path.join(codexRoot, 'secrets', 'nabu');
  if (platform === 'win32') {
    return path.join(process.env.APPDATA || home, 'Nabu', 'credentials');
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'nabu', 'credentials');
}

function assertNotLink(target) {
  if (!fs.existsSync(target)) return;
  const details = fs.lstatSync(target);
  if (details.isSymbolicLink()) throw new Error(`Refusing symlink or reparse point: ${target}`);
}

function windowsSid() {
  const result = spawnSync('whoami.exe', ['/user', '/fo', 'csv', '/nh'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) throw new Error('Unable to identify the current Windows user SID');
  const match = result.stdout.match(/"(S-1-[0-9-]+)"/u);
  if (!match) throw new Error('Unable to parse the current Windows user SID');
  return match[1];
}

function runCommand(command) {
  const result = spawnSync(command.command, command.args, {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`${command.command} failed while securing the Nabu profile`);
  }
}

function prepareDirectory(directoryPath, platform = process.platform) {
  assertNotLink(directoryPath);
  fs.mkdirSync(directoryPath, { recursive: true, mode: 0o700 });
  assertNotLink(directoryPath);
  if (platform === 'win32') {
    const [directoryCommand] = getWindowsAclCommands({
      directoryPath,
      filePath: path.join(directoryPath, 'probe'),
      sid: windowsSid(),
    });
    runCommand(directoryCommand);
  } else {
    fs.chmodSync(directoryPath, 0o700);
  }
  const probe = path.join(directoryPath, `.nabu-write-probe-${crypto.randomUUID()}`);
  const handle = fs.openSync(probe, 'wx', 0o600);
  fs.fsyncSync(handle);
  fs.closeSync(handle);
  if (platform !== 'win32') fs.chmodSync(probe, 0o600);
  fs.unlinkSync(probe);
}

function atomicWriteProfile(profilePath, content, { replace, platform = process.platform }) {
  const directoryPath = path.dirname(profilePath);
  const temporaryPath = path.join(directoryPath, `.nabu-profile-${crypto.randomUUID()}.tmp`);
  if (!replace && fs.existsSync(profilePath)) {
    throw new Error(`Profile already exists: ${profilePath}. Use --replace only after explicit approval.`);
  }
  assertNotLink(profilePath);
  let handle;
  try {
    handle = fs.openSync(temporaryPath, 'wx', 0o600);
    fs.writeFileSync(handle, content, { encoding: 'utf8' });
    fs.fsyncSync(handle);
    fs.closeSync(handle);
    handle = undefined;
    if (platform === 'win32') {
      const [, fileCommand] = getWindowsAclCommands({
        directoryPath,
        filePath: temporaryPath,
        sid: windowsSid(),
      });
      runCommand(fileCommand);
    } else {
      fs.chmodSync(temporaryPath, 0o600);
    }
    fs.renameSync(temporaryPath, profilePath);
  } catch (error) {
    if (handle !== undefined) fs.closeSync(handle);
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath);
    throw error;
  }
}

function parseProfile(content) {
  const result = {};
  for (const line of content.trimEnd().split(/\r?\n/u)) {
    const separator = line.indexOf('=');
    if (separator <= 0) throw new Error('Malformed stored Nabu profile');
    const key = line.slice(0, separator);
    if (!PROFILE_KEYS.includes(key) || Object.hasOwn(result, key)) {
      throw new Error('Unexpected or duplicate stored Nabu profile key');
    }
    result[key] = line.slice(separator + 1);
  }
  if (Object.keys(result).length !== PROFILE_KEYS.length) {
    throw new Error('Stored Nabu profile is incomplete');
  }
  return result;
}

function joinDeploymentPath(apiBaseUrl, relativePath) {
  const suffix = String(relativePath || '/api/vault/tree').replace(/^\/+/, '');
  return `${apiBaseUrl}/${suffix}`;
}

async function redeemInvite(apiBaseUrl, inviteUrl) {
  const idempotencyKey = crypto.randomBytes(32).toString('base64url');
  const request = () => fetch(joinDeploymentPath(apiBaseUrl, '/api/shared-spaces/invites/redeem'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'idempotency-key': idempotencyKey,
    },
    body: JSON.stringify({ inviteUrl }),
  });
  let response;
  try {
    response = await request();
  } catch {
    try {
      response = await request();
    } catch {
      throw new Error('Invite redemption outcome is unknown after one safe recovery attempt; do not redeem again');
    }
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = typeof body.code === 'string' ? ` (${body.code})` : '';
    throw new Error(`Invite redemption failed with HTTP ${response.status}${code}`);
  }
  return body;
}

async function verifyProfile(profile, links = {}) {
  const response = await fetch(joinDeploymentPath(
    profile.NABU_API_BASE_URL,
    links.tree || '/api/vault/tree',
  ), {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${profile.NABU_ACCESS_TOKEN}`,
    },
  });
  if (!response.ok) throw new Error(`Stored-profile verification failed with HTTP ${response.status}`);
  return response.status;
}

async function readStdin() {
  let input = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) input += chunk;
  return input.trim();
}

export async function connect(options, input) {
  let apiBaseUrl;
  let response;
  if (options.mode === 'response') {
    apiBaseUrl = canonicalizeApiBase(options.apiBaseUrl);
    response = JSON.parse(input);
  } else {
    const candidate = input.startsWith('{') ? JSON.parse(input).inviteUrl : input;
    const inviteUrl = assertSafeValue('inviteUrl', candidate);
    apiBaseUrl = apiBaseFromInvite(inviteUrl);
    const credentialsRoot = path.resolve(options.credentialsDir || defaultCredentialsRoot());
    assertNotLink(credentialsRoot);
    prepareDirectory(path.join(credentialsRoot, deploymentHash(apiBaseUrl)));
    response = await redeemInvite(apiBaseUrl, inviteUrl);
  }
  const parsed = parseRedemptionResponse(response);
  const credentialsRoot = path.resolve(options.credentialsDir || defaultCredentialsRoot());
  assertNotLink(credentialsRoot);
  const profilePath = getProfilePath({
    credentialsRoot,
    deploymentHash: deploymentHash(apiBaseUrl),
    sharedSpaceId: parsed.sharedSpaceId,
  });
  prepareDirectory(path.dirname(profilePath));
  atomicWriteProfile(profilePath, buildProfileContent({ apiBaseUrl, ...parsed }), {
    replace: options.replace,
  });
  const reloaded = parseProfile(fs.readFileSync(profilePath, 'utf8'));
  const verificationStatus = await verifyProfile(reloaded, parsed.links);
  return {
    connected: true,
    profilePath,
    sharedSpaceId: parsed.sharedSpaceId,
    rootPath: parsed.rootPath,
    permissions: parsed.permissions,
    accessTokenExpiresAt: parsed.accessTokenExpiresAt,
    verificationStatus,
    nextAction: 'configure_mcp_bearer_from_profile',
  };
}

function usage() {
  return `Usage:\n  printf '%s' "$INVITE_URL" | node nabu-connect.mjs [--credentials-dir PATH]\n  printf '%s' "$RESPONSE_JSON" | node nabu-connect.mjs --response-stdin --api-base URL [--credentials-dir PATH]\n\nSecrets are read only from stdin and are never printed.`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const input = await readStdin();
  if (!input) throw new Error('Expected an invite URL or redemption response on stdin');
  const result = await connect(options, input);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`nabu-connect: ${error.message}\n`);
    process.exitCode = 1;
  });
}
