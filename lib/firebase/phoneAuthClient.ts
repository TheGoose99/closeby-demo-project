import type { Auth, ConfirmationResult } from 'firebase/auth'

/** Invisible `RecaptchaVerifier` must anchor to the SMS submit control id (Firebase web phone-auth doc). */
export const FIREBASE_PHONE_RECAPTCHA_BUTTON_ID = 'booking-phone-send-sms'

export type PhoneOtpStart = {
  confirmation: ConfirmationResult
  verifier: unknown
}

export async function startPhoneOtp(auth: Auth, phoneE164: string, container: string | HTMLElement): Promise<PhoneOtpStart> {
  const { signInWithPhoneNumber, RecaptchaVerifier } = await import('firebase/auth')

  // https://firebase.google.com/docs/auth/web/phone-auth — invisible size + submit element id.
  const verifier = new RecaptchaVerifier(auth, container, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {},
  })

  try {
    const confirmation = await signInWithPhoneNumber(auth, phoneE164, verifier)
    return { confirmation, verifier }
  } catch (e) {
    try {
      verifier.clear()
    } catch {
      // ignore
    }
    throw e
  }
}

export async function confirmPhoneOtp(confirmation: ConfirmationResult, code: string) {
  return confirmation.confirm(code)
}
