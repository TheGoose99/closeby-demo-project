import { getAppCheck } from 'firebase-admin/app-check'
import { getFirebaseAdminApp } from '@/lib/firebase/admin'

export async function verifyFirebaseAppCheckToken(appCheckToken: string) {
  const token = appCheckToken.trim()
  if (!token) {
    throw new Error('Missing App Check token')
  }
  await getAppCheck(getFirebaseAdminApp()).verifyToken(token)
}
