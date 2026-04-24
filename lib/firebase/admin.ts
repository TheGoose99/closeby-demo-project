import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let app: App | undefined

function getServiceAccountJson(): string {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (!raw) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON (Firebase Admin credentials)')
  }
  return raw
}

export function getFirebaseAdminApp(): App {
  if (app) return app
  if (getApps().length > 0) {
    app = getApps()[0]!
    return app
  }

  const parsed = JSON.parse(getServiceAccountJson()) as {
    project_id?: string
    client_email?: string
    private_key?: string
  }

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing required fields')
  }

  app = initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, '\n'),
    }),
  })

  return app
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp())
}
