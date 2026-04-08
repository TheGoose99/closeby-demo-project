import test from 'node:test'
import assert from 'node:assert/strict'
import { buildBookingOptions } from '../lib/booking-options.js'

test('buildBookingOptions uses config.services durations/prices', () => {
  const config = {
    integrations: {
      calComEventSlugs: {
        initial: 'consultatie-initiala',
        session: 'sedinta-individuala',
        couple: 'terapie-cuplu',
      },
    },
    services: [
      { title: 'Consultație inițială', duration: 30, currency: 'RON', calEventSlug: 'consultatie-initiala', icon: '🌱' },
      { title: 'Psihoterapie individuală', duration: 50, price: 280, currency: 'RON', calEventSlug: 'sedinta-individuala', icon: '🧠' },
      { title: 'Terapie de cuplu', duration: 75, price: 390, currency: 'RON', calEventSlug: 'terapie-cuplu', icon: '💑' },
    ],
  }

  const opts = buildBookingOptions(config)
  const session = opts.find((o) => o.key === 'session')
  assert.ok(session)
  assert.match(session.note, /50 min/)
  assert.match(session.note, /280 RON/)
})

