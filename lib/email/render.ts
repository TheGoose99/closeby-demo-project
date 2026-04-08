import { render } from '@react-email/render'
import type { ReactElement } from 'react'

export async function renderEmail(element: ReactElement) {
  return {
    html: await render(element, { pretty: true }),
    text: await render(element, { plainText: true }),
  }
}

