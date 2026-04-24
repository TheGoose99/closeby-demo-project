import { getToken, initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check'
import { getFirebaseWebApp } from '@/lib/firebase/clientApp'

let appCheck: AppCheck | undefined

function shouldInitAppCheck() {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY?.trim())
}

export function getOrInitFirebaseWebAppCheck(): AppCheck | undefined {
  if (appCheck) return appCheck
  if (!shouldInitAppCheck()) return undefined

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY!.trim()
  appCheck = initializeAppCheck(getFirebaseWebApp(), {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  })

  return appCheck
}

export async function tryGetFirebaseAppCheckTokenForRequest(): Promise<string | null> {
  try {
    const ac = getOrInitFirebaseWebAppCheck()
    if (!ac) return null
    const res = await getToken(ac, false)
    return res.token
  } catch {
    return null
  }
}
