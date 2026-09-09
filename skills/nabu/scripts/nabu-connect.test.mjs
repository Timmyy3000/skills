import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  buildProfileContent,
  connect,
  getProfilePath,
  getWindowsAclCommands,
  parseRedemptionResponse,
} from './nabu-connect.mjs';

const deploymentHash = 'sha256-87fa6b9976e314bdd2e306828d4603582905e8cd1c0761eb034b2cec688dd446';
const sharedSpaceId = 'space_fb8d79b5-3b30-49a5-bc71-4d7629adbb6f';

const response = {
  contractVersion: 2,
  sharedSpaceId,
  rootPath: 'projects/allies',
  permissions: ['read', 'write'],
  accessToken: 'secret-token-value',
  accessTokenExpiresAt: '2027-03-06T15:33:17.700Z',
  links: { tree: '/api/vault/tree' },
};

test('uses Windows path separators and the server ID without duplicating space_', () => {
  const result = getProfilePath({
    credentialsRoot: 'C:\\Users\\ASUS\\.codex\\secrets\\nabu',
    deploymentHash,
    sharedSpaceId,
    platform: 'win32',
  });

  assert.equal(
    result,
    'C:\\Users\\ASUS\\.codex\\secrets\\nabu\\sha256-87fa6b9976e314bdd2e306828d4603582905e8cd1c0761eb034b2cec688dd446\\space_fb8d79b5-3b30-49a5-bc71-4d7629adbb6f.env',
  );
  assert.equal(result.includes('ASUS.codex'), false);
  assert.equal(result.includes('space_space_'), false);
});

test('builds icacls commands using a SID and no unavailable SetAccessControl call', () => {
  const commands = getWindowsAclCommands({
    directoryPath: 'C:\\Users\\ASUS\\.codex\\secrets\\nabu\\hash',
    filePath: 'C:\\Users\\ASUS\\.codex\\secrets\\nabu\\hash\\profile.env',
    sid: 'S-1-5-21-1234',
  });

  assert.deepEqual(commands, [
    {
      command: 'icacls.exe',
      args: [
        'C:\\Users\\ASUS\\.codex\\secrets\\nabu\\hash',
        '/inheritance:r',
        '/grant:r',
        '*S-1-5-21-1234:(OI)(CI)F',
      ],
    },
    {
      command: 'icacls.exe',
      args: [
        'C:\\Users\\ASUS\\.codex\\secrets\\nabu\\hash\\profile.env',
        '/inheritance:r',
        '/grant:r',
        '*S-1-5-21-1234:F',
      ],
    },
  ]);
  assert.equal(JSON.stringify(commands).includes('SetAccessControl'), false);
});

test('accepts the shared redemption fields and emits exactly seven profile keys', () => {
  const parsed = parseRedemptionResponse(response);
  const content = buildProfileContent({
    apiBaseUrl: 'https://nabu.timi.click',
    ...parsed,
  });

  const lines = content.trimEnd().split('\n');
  assert.deepEqual(lines.map((line) => line.slice(0, line.indexOf('='))), [
    'NABU_PROFILE_VERSION',
    'NABU_API_BASE_URL',
    'NABU_SHARED_SPACE_ID',
    'NABU_ROOT_PATH',
    'NABU_PERMISSIONS',
    'NABU_ACCESS_TOKEN_EXPIRES_AT',
    'NABU_ACCESS_TOKEN',
  ]);
  assert.match(content, /NABU_SHARED_SPACE_ID=space_fb8d79b5-3b30-49a5-bc71-4d7629adbb6f/);
  assert.match(content, /NABU_ACCESS_TOKEN=secret-token-value/);
});

test('rejects owner-connection response fields instead of silently losing a scoped token', () => {
  assert.throws(
    () => parseRedemptionResponse({ credential: 'token', expiresAt: '2027-01-01T00:00:00Z' }),
    /accessToken/,
  );
});

test('selects win32 path semantics without depending on the host OS', () => {
  assert.equal(path.win32.basename(getProfilePath({
    credentialsRoot: 'C:\\Users\\ASUS\\.codex\\secrets\\nabu',
    deploymentHash,
    sharedSpaceId,
    platform: 'win32',
  })), `${sharedSpaceId}.env`);
});

async function startFakeNabu() {
  let redemptionCount = 0;
  const server = http.createServer((request, reply) => {
    if (request.url === '/api/shared-spaces/invites/redeem' && request.method === 'POST') {
      redemptionCount += 1;
      assert.match(request.headers['idempotency-key'], /^[A-Za-z0-9_-]{40,}$/u);
      reply.writeHead(200, { 'content-type': 'application/json' });
      reply.end(JSON.stringify(response));
      return;
    }
    if (request.url === '/api/vault/tree') {
      assert.equal(request.headers.authorization, 'Bearer secret-token-value');
      reply.writeHead(200, { 'content-type': 'application/json' });
      reply.end(JSON.stringify({ tree: [] }));
      return;
    }
    reply.writeHead(404).end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
    redemptionCount: () => redemptionCount,
  };
}

test('redeems, persists, reloads, and verifies without returning the token', async () => {
  const fake = await startFakeNabu();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nabu-connect-'));
  try {
    const result = await connect({
      mode: 'invite',
      credentialsDir: root,
      replace: false,
      apiBaseUrl: '',
    }, `${fake.baseUrl}/invites/one-time-secret`);

    assert.equal(result.connected, true);
    assert.equal(result.verificationStatus, 200);
    assert.equal(fake.redemptionCount(), 1);
    assert.equal(JSON.stringify(result).includes('secret-token-value'), false);
    assert.equal(path.basename(result.profilePath), `${sharedSpaceId}.env`);
    if (process.platform !== 'win32') {
      assert.equal(fs.statSync(result.profilePath).mode & 0o777, 0o600);
      assert.equal(fs.statSync(path.dirname(result.profilePath)).mode & 0o777, 0o700);
    }
    assert.match(fs.readFileSync(result.profilePath, 'utf8'), /NABU_ACCESS_TOKEN=secret-token-value/);
  } finally {
    await fake.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('finishes storage from an existing MCP response without redeeming again', async () => {
  const fake = await startFakeNabu();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nabu-connect-response-'));
  try {
    const options = {
      mode: 'response',
      credentialsDir: root,
      replace: false,
      apiBaseUrl: fake.baseUrl,
    };
    const result = await connect(options, JSON.stringify(response));

    assert.equal(result.connected, true);
    assert.equal(fake.redemptionCount(), 0);
    assert.equal(result.verificationStatus, 200);
    await assert.rejects(connect(options, JSON.stringify(response)), /Profile already exists/);

    const replaced = await connect({ ...options, replace: true }, JSON.stringify(response));
    assert.equal(replaced.connected, true);
    assert.equal(fake.redemptionCount(), 0);
  } finally {
    await fake.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a symlinked deployment directory before consuming an invite', {
  skip: process.platform === 'win32',
}, async () => {
  const fake = await startFakeNabu();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nabu-connect-link-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'nabu-connect-outside-'));
  try {
    const hash = deploymentHashForTest(fake.baseUrl);
    fs.symlinkSync(outside, path.join(root, hash), 'dir');
    await assert.rejects(
      connect({ mode: 'invite', credentialsDir: root, replace: false, apiBaseUrl: '' }, `${fake.baseUrl}/invites/secret`),
      /symlink or reparse point/,
    );
    assert.equal(fake.redemptionCount(), 0);
  } finally {
    await fake.close();
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});

function deploymentHashForTest(apiBaseUrl) {
  return `sha256-${crypto.createHash('sha256').update(apiBaseUrl).digest('hex')}`;
}
