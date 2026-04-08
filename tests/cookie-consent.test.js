import test from 'node:test'
import assert from 'node:assert/strict'
import { clearCookieConsent, getCookieConsent, setCookieConsent } from '../lib/cookie-consent.js'

function createMemoryStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  }
}

test('cookie consent: set/get accepted', () => {
  const storage = createMemoryStorage()
  assert.equal(getCookieConsent(storage), null)
  assert.equal(setCookieConsent('accepted', storage), true)
  assert.equal(getCookieConsent(storage), 'accepted')
})

test('cookie consent: set/get declined', () => {
  const storage = createMemoryStorage()
  assert.equal(setCookieConsent('declined', storage), true)
  assert.equal(getCookieConsent(storage), 'declined')
})

test('cookie consent: clear resets to null', () => {
  const storage = createMemoryStorage()
  setCookieConsent('accepted', storage)
  assert.equal(clearCookieConsent(storage), true)
  assert.equal(getCookieConsent(storage), null)
})

test('cookie consent: blocked storage does not throw', () => {
  const storage = {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
    removeItem: () => { throw new Error('blocked') },
  }
  assert.equal(getCookieConsent(storage), null)
  assert.equal(setCookieConsent('accepted', storage), false)
  assert.equal(clearCookieConsent(storage), false)
})

