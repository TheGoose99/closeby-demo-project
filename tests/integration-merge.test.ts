import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeCalIntegrationsFromDbRow } from '../lib/integrations/mergeCalDbFields'
import { demoConfig } from '../config/clients/demo'
import { getActiveIntegrationTenantSlug } from '../lib/integrations/resolveCalSecrets'
import { extractCalOrganizerUsernameFromWebhookBody } from '../lib/integrations/calWebhookTenant'

test('mergeCalIntegrationsFromDbRow: DB row overrides public Cal fields', () => {
  const base = { ...demoConfig.integrations, calComUsername: 'env-user' }
  const merged = mergeCalIntegrationsFromDbRow(base, {
    cal_com_username: 'db-user',
    cal_com_canonical_event_slugs: { initial: 'i1', session: 'i2', couple: 'i3' },
    cal_com_event_slugs: { initial: 'o1', session: 'o2', couple: 'o3' },
  })
  assert.equal(merged.calComUsername, 'db-user')
  assert.deepEqual(merged.calComCanonicalEventSlugs, { initial: 'i1', session: 'i2', couple: 'i3' })
  assert.deepEqual(merged.calComEventSlugs, { initial: 'o1', session: 'o2', couple: 'o3' })
})

test('mergeCalIntegrationsFromDbRow: null row leaves integrations unchanged', () => {
  const base = { ...demoConfig.integrations }
  const merged = mergeCalIntegrationsFromDbRow(base, null)
  assert.deepEqual(merged, base)
})

test('extractCalOrganizerUsernameFromWebhookBody reads payload.organizer.username', () => {
  const u = extractCalOrganizerUsernameFromWebhookBody({
    triggerEvent: 'BOOKING_CREATED',
    payload: {
      uid: 'x',
      organizer: { username: 'DrDemo', name: '', email: '', timeZone: 'UTC' },
    },
  })
  assert.equal(u, 'drdemo')
})

test('getActiveIntegrationTenantSlug: WEBHOOK_TENANT_CLIENT_SLUG wins over SUPABASE_TENANT_CLIENT_SLUG', () => {
  const prev = {
    w: process.env.WEBHOOK_TENANT_CLIENT_SLUG,
    s: process.env.SUPABASE_TENANT_CLIENT_SLUG,
  }
  try {
    process.env.WEBHOOK_TENANT_CLIENT_SLUG = 'hook-tenant'
    process.env.SUPABASE_TENANT_CLIENT_SLUG = 'ui-tenant'
    assert.equal(getActiveIntegrationTenantSlug(), 'hook-tenant')
    delete process.env.WEBHOOK_TENANT_CLIENT_SLUG
    assert.equal(getActiveIntegrationTenantSlug(), 'ui-tenant')
  } finally {
    if (prev.w === undefined) delete process.env.WEBHOOK_TENANT_CLIENT_SLUG
    else process.env.WEBHOOK_TENANT_CLIENT_SLUG = prev.w
    if (prev.s === undefined) delete process.env.SUPABASE_TENANT_CLIENT_SLUG
    else process.env.SUPABASE_TENANT_CLIENT_SLUG = prev.s
  }
})

test('mergeCalIntegrationsFromDbRow: ignores invalid jsonb shapes', () => {
  const base = { ...demoConfig.integrations }
  const merged = mergeCalIntegrationsFromDbRow(base, {
    cal_com_username: 'ok',
    cal_com_canonical_event_slugs: ['not', 'an', 'object'],
    cal_com_event_slugs: { initial: 1, session: 2, couple: 3 } as unknown,
  })
  assert.equal(merged.calComUsername, 'ok')
  assert.deepEqual(merged.calComCanonicalEventSlugs, base.calComCanonicalEventSlugs)
  assert.deepEqual(merged.calComEventSlugs, base.calComEventSlugs)
})
