import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveCalRuntimeIntegrations } from '../lib/integrations/cal-runtime.js'

const baseIntegrations = {
  calComUsername: 'static-user',
  calComCanonicalEventSlugs: {
    initial: 'consultatie-initiala',
    session: 'sedinta-individuala',
    couple: 'terapie-cuplu',
  },
  calComEventSlugs: {
    initial: '30min',
    session: '50min',
    couple: '75min',
  },
}

test('cal runtime resolver keeps static fallback when env/tenant missing', () => {
  const resolved = resolveCalRuntimeIntegrations({
    clientSlug: 'demo',
    baseIntegrations,
    env: {},
  })

  assert.equal(resolved.calComUsername, 'static-user')
  assert.equal(resolved.calComCanonicalEventSlugs.initial, 'consultatie-initiala')
  assert.equal(resolved.calComEventSlugs.initial, '30min')
})

test('cal runtime resolver applies env overrides', () => {
  const resolved = resolveCalRuntimeIntegrations({
    clientSlug: 'demo',
    baseIntegrations,
    env: {
      CAL_COM_USERNAME: 'env-user',
      CAL_COM_CANONICAL_EVENT_SLUG_INITIAL: 'env-initial',
      CAL_COM_EVENT_SLUG_INITIAL: 'env-embed-initial',
    },
  })

  assert.equal(resolved.calComUsername, 'env-user')
  assert.equal(resolved.calComCanonicalEventSlugs.initial, 'env-initial')
  assert.equal(resolved.calComEventSlugs.initial, 'env-embed-initial')
  assert.equal(resolved.calComCanonicalEventSlugs.session, 'sedinta-individuala')
})

test('cal runtime resolver gives precedence to tenant overrides over env', () => {
  const resolved = resolveCalRuntimeIntegrations({
    clientSlug: 'demo',
    baseIntegrations,
    env: {
      CAL_COM_USERNAME: 'env-user',
      TENANT_CAL_CONFIG_JSON: JSON.stringify({
        demo: {
          calComUsername: 'tenant-user',
          calComCanonicalEventSlugs: { initial: 'tenant-initial' },
          calComEventSlugs: { initial: 'tenant-embed-initial' },
        },
      }),
    },
  })

  assert.equal(resolved.calComUsername, 'tenant-user')
  assert.equal(resolved.calComCanonicalEventSlugs.initial, 'tenant-initial')
  assert.equal(resolved.calComEventSlugs.initial, 'tenant-embed-initial')
})
