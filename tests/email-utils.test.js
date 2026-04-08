import test from 'node:test'
import assert from 'node:assert/strict'

import { escapeHtml } from '../lib/email/utils.js'

test('escapeHtml escapes dangerous characters', () => {
  assert.equal(escapeHtml(`<script>alert("x")</script>&'`), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#039;')
})

