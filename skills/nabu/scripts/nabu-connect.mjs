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

export function parseWindowsAclDump(content, sid) {
  assertSafeValue('Windows SID', sid);
  if (!/^S-1-[0-9-]+$/u.test(sid)) throw new Error('Invalid Windows SID');
  const currentAliases = sid.endsWith('-500') ? ['LA'] : [];
  const allowed = new Set([
    sid.toUpperCase(),
    ...currentAliases,
    'SY',
    'BA',
    'S-1-5-18',
    'S-1-5-32-544',
  ]);
  const unapproved = [];
  let sawCurrentSid = false;
  for (const match of content.matchAll(/\(([^()]*)\)/gu)) {
    const fields = match[1].split(';');
    if (!['A', 'OA'].includes(fields[0])) continue;
    const trustee = fields.at(-1).toUpperCase();
    if (trustee === sid.toUpperCase() || currentAliases.includes(trustee)) sawCurrentSid = true;
    if (!allowed.has(trustee)) unapproved.push(trustee);
  }
  if (!sawCurrentSid) unapproved.push('MISSING_CURRENT_SID');
  return [...new Set(unapproved)];
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

export function defaultCredentialsRoot({
  platform = process.platform,
  env = process.env,
  home = os.homedir(),
} = {}) {
  if (env.NABU_CREDENTIALS_DIR) return env.NABU_CREDENTIALS_DIR;
  if (platform === 'win32') {
    return path.win32.join(env.APPDATA || home, 'Nabu', 'credentials');
  }
  return path.posix.join(env.XDG_CONFIG_HOME || path.posix.join(home, '.config'), 'nabu', 'credentials');
}

function assertNotLink(target) {
  let details;
  try {
    details = fs.lstatSync(target);
  } catch (error) {
    if (error && error.code === 'ENOENT') return;
    throw error;
  }
  if (details.isSymbolicLink()) throw new Error(`Refusing symlink or reparse point: ${target}`);
}

function assertCreatablePathNotLink(target) {
  let current = path.resolve(target);
  while (true) {
    try {
      const details = fs.lstatSync(current);
      if (details.isSymbolicLink()) {
        throw new Error(`Refusing symlink or reparse point: ${current}`);
      }
      return;
    } catch (error) {
      if (!error || error.code !== 'ENOENT') throw error;
      const parent = path.dirname(current);
      if (parent === current) return;
      current = parent;
    }
  }
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

function runCommand(command, failureMessage = 'securing the Nabu profile') {
  const result = spawnSync(command.command, command.args, {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    const detail = String(result.stderr || result.stdout || '').trim().slice(0, 500);
    throw new Error(`${command.command} failed while ${failureMessage}${detail ? `: ${detail}` : ''}`);
  }
  return result;
}

function decodeIcaclsDump(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString('utf16le');
  }
  if (buffer.includes(0)) return buffer.toString('utf16le');
  return buffer.toString('utf8');
}

function auditWindowsAcl(targetPath, sid) {
  const dumpPath = path.join(os.tmpdir(), `.nabu-acl-${crypto.randomUUID()}.txt`);
  try {
    runCommand({
      command: 'icacls.exe',
      args: [targetPath, '/save', dumpPath, '/q'],
    }, 'exporting the Nabu profile ACL for verification');
    const unapproved = parseWindowsAclDump(decodeIcaclsDump(fs.readFileSync(dumpPath)), sid);
    if (unapproved.length > 0) {
      throw new Error(`Nabu profile ACL contains unapproved allow identities: ${unapproved.join(',')}`);
    }
  } finally {
    if (fs.existsSync(dumpPath)) fs.rmSync(dumpPath);
  }
}

function secureWindowsPath(targetPath, aclCommand, sid) {
  runCommand(aclCommand);
  auditWindowsAcl(targetPath, sid);
}

function prepareDirectory(directoryPath, platform = process.platform) {
  assertNotLink(directoryPath);
  fs.mkdirSync(directoryPath, { recursive: true, mode: 0o700 });
  assertNotLink(directoryPath);
  if (platform === 'win32') {
    const sid = windowsSid();
    const [directoryCommand] = getWindowsAclCommands({
      directoryPath,
      filePath: path.join(directoryPath, 'probe'),
      sid,
    });
    secureWindowsPath(directoryPath, directoryCommand, sid);
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

function atomicWriteRestricted(targetPath, content, { replace, platform = process.platform }) {
  const directoryPath = path.dirname(targetPath);
  const temporaryPath = path.join(directoryPath, `.nabu-write-${crypto.randomUUID()}.tmp`);
  if (!replace && fs.existsSync(targetPath)) {
    throw new Error(`Credential file already exists: ${targetPath}. Use --replace only after explicit approval.`);
  }
  assertNotLink(targetPath);
  let handle;
  try {
    handle = fs.openSync(temporaryPath, 'wx', 0o600);
    fs.writeFileSync(handle, content, { encoding: 'utf8' });
    fs.fsyncSync(handle);
    fs.closeSync(handle);
    handle = undefined;
    if (platform === 'win32') {
      const sid = windowsSid();
      const [, fileCommand] = getWindowsAclCommands({
        directoryPath,
        filePath: temporaryPath,
        sid,
      });
      secureWindowsPath(temporaryPath, fileCommand, sid);
    } else {
      fs.chmodSync(temporaryPath, 0o600);
    }
    fs.renameSync(temporaryPath, targetPath);
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
  if (!process.stdin.isTTY) {
    let input = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) input += chunk;
    return input.trim();
  }
  if (typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Secure interactive input is unavailable; pass the secret through process stdin');
  }
  process.stderr.write('Paste the Nabu invite or response JSON (input hidden), then press Enter: ');
  process.stdin.setEncoding('utf8');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let input = '';
    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
      process.stderr.write('\n');
    };
    const onData = (chunk) => {
      if (chunk === '\u0003') {
        finish();
        reject(new Error('Input cancelled'));
        return;
      }
      if (chunk.includes('\r') || chunk.includes('\n')) {
        input += chunk.split(/[\r\n]/u, 1)[0];
        finish();
        resolve(input.trim());
        return;
      }
      if (chunk === '\u007f' || chunk === '\b') input = input.slice(0, -1);
      else input += chunk;
    };
    process.stdin.on('data', onData);
  });
}

export async function connect(options, input) {
  let apiBaseUrl;
  let response;
  let directoryPrepared = false;
  const credentialsRoot = path.resolve(options.credentialsDir || defaultCredentialsRoot());
  assertCreatablePathNotLink(credentialsRoot);

  if (options.mode === 'response') {
    apiBaseUrl = canonicalizeApiBase(options.apiBaseUrl);
    response = JSON.parse(input);
  } else {
    const candidate = input.startsWith('{') ? JSON.parse(input).inviteUrl : input;
    const inviteUrl = assertSafeValue('inviteUrl', candidate);
    apiBaseUrl = apiBaseFromInvite(inviteUrl);
    prepareDirectory(path.join(credentialsRoot, deploymentHash(apiBaseUrl)));
    directoryPrepared = true;
    response = await redeemInvite(apiBaseUrl, inviteUrl);
  }

  const directoryPath = path.join(credentialsRoot, deploymentHash(apiBaseUrl));
  if (!directoryPrepared) prepareDirectory(directoryPath);
  const recoverableToken = response && typeof response === 'object'
    ? response.accessToken
    : '';
  let recoveryPath = '';
  let profilePath = '';
  let profileWritten = false;

  if (typeof recoverableToken === 'string' && recoverableToken.length > 0) {
    assertSafeValue('accessToken', recoverableToken);
    recoveryPath = path.join(directoryPath, `.nabu-recovery-${crypto.randomUUID()}.json`);
    atomicWriteRestricted(recoveryPath, `${JSON.stringify(response)}\n`, { replace: false });
  }

  try {
    const parsed = parseRedemptionResponse(response);
    profilePath = getProfilePath({
      credentialsRoot,
      deploymentHash: deploymentHash(apiBaseUrl),
      sharedSpaceId: parsed.sharedSpaceId,
    });
    atomicWriteRestricted(profilePath, buildProfileContent({ apiBaseUrl, ...parsed }), {
      replace: options.replace,
    });
    profileWritten = true;
    const reloaded = parseProfile(fs.readFileSync(profilePath, 'utf8'));
    const verificationStatus = await verifyProfile(reloaded, parsed.links);
    let recoveryCleanupPath = '';
    if (recoveryPath) {
      try {
        fs.rmSync(recoveryPath);
      } catch {
        recoveryCleanupPath = recoveryPath;
      }
    }
    return {
      connected: true,
      profilePath,
      sharedSpaceId: parsed.sharedSpaceId,
      rootPath: parsed.rootPath,
      permissions: parsed.permissions,
      accessTokenExpiresAt: parsed.accessTokenExpiresAt,
      verificationStatus,
      nextAction: 'configure_mcp_bearer_from_profile',
      ...(recoveryCleanupPath ? { recoveryCleanupPath } : {}),
    };
  } catch (error) {
    if (profileWritten) {
      let cleanupSuffix = '';
      if (recoveryPath && fs.existsSync(recoveryPath)) {
        try {
          fs.rmSync(recoveryPath);
        } catch {
          cleanupSuffix = `; remove the redundant recovery file at ${recoveryPath}`;
        }
      }
      throw new Error(`${error.message}. The credential profile remains stored at ${profilePath}${cleanupSuffix}`);
    }
    if (recoveryPath) {
      throw new Error(`${error.message}. The redeemed response is preserved at ${recoveryPath}; do not redeem the invite again`);
    }
    throw error;
  }
}

function usage() {
  return `Usage:\n  node nabu-connect.mjs [--credentials-dir PATH]\n  node nabu-connect.mjs --response-stdin --api-base URL [--credentials-dir PATH]\n\nInteractive terminals prompt for hidden input. Automation must write the invite or response JSON directly to process stdin; do not place either secret in arguments, environment variables, shell variables, or temporary files. Secrets are never printed.`;
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
