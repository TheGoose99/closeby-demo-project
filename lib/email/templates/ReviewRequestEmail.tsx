import { Button, Section, Text } from '@react-email/components'
import type { CalBookingData } from '@/types/calcom'
import type { ClientConfig } from '@/types/client-config'
import { BaseLayout } from '@/lib/email/templates/BaseLayout'

type Props = {
  booking: CalBookingData
  config: Pick<ClientConfig, 'gdpr' | 'integrations' | 'shortName'>
}

export function ReviewRequestEmail({ booking, config }: Props) {
  const attendee = booking.attendees[0]
  const preview = 'Lasă-ne o recenzie (opțional)'

  return (
    <BaseLayout preview={preview} title="Mulțumim că ai ales cabinetul nostru" config={config}>
      <Text style={styles.p}>Bună ziua, {attendee?.name},</Text>
      <Text style={styles.p}>
        Sperăm că ședința ți-a fost de folos. Dacă dorești, poți lăsa o recenzie pe Google — ne ajută enorm și pe
        alți oameni să ne găsească.
      </Text>

      <Section style={styles.ctaWrap}>
        <Button href={config.integrations.reviewLink} style={styles.button}>
          ★ Lasă o recenzie Google
        </Button>
      </Section>

      <Text style={styles.small}>
        Recenzia este complet opțională. Nu ești obligat să menționezi detalii sensibile — poți lăsa feedback despre
        programare, cabinet sau profesionalism.
      </Text>
    </BaseLayout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  p: { fontSize: 15, color: '#3d4a3a', margin: '0 0 12px', lineHeight: '22px' },
  small: { fontSize: 13, color: '#a8b4a5', margin: '12px 0 0', lineHeight: '20px' },
  ctaWrap: { textAlign: 'center', marginTop: 18 },
  button: {
    backgroundColor: '#4d7a5e',
    color: '#ffffff',
    borderRadius: 999,
    padding: '12px 20px',
    textDecoration: 'none',
    fontWeight: 600,
    display: 'inline-block',
  },
}

