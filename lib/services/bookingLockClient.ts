export type PhoneLockResponse = {
  allowed: boolean
  locked: boolean
  error?: string
}

export async function checkAndLockPhone(phone: string): Promise<PhoneLockResponse> {
  const response = await fetch('/api/anti-abuse/phone-lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  })

  const payload = (await response.json().catch(() => ({}))) as Partial<PhoneLockResponse>
  if (!response.ok) {
    return { allowed: false, locked: false, error: payload.error ?? 'Lock check failed' }
  }

  return {
    allowed: Boolean(payload.allowed),
    locked: Boolean(payload.locked),
    error: payload.error,
  }
}

