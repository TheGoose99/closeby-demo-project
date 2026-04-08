import { Section, Text } from '@react-email/components'
import type { CalBookingData } from '@/types/calcom'
import type { ClientConfig } from '@/types/client-config'
import { BaseLayout } from '@/lib/email/templates/BaseLayout'
import { formatDateTimeRo } from '@/lib/email/utils'

type Props = {
  booking: CalBookingData
  config: Pick<ClientConfig, 'shortName' | 'address' | 'gdpr'>
}

export function BookingConfirmationEmail({ booking, config }: Props) {
  const attendee = booking.attendees[0]
  const dateTime = formatDateTimeRo(booking.startTime)
  const preview = `Programarea ta a fost confirmată — ${dateTime}`

  return (
    <BaseLayout preview={preview} title="Programarea ta a fost confirmată ✓" config={config}>
      <Text style={styles.p}>Bună ziua, {attendee?.name},</Text>
      <Text style={styles.p}>Te așteptăm cu drag. Iată detaliile programării tale:</Text>

      <Section style={styles.card}>
        <Text style={styles.cardLabel}>Data și ora</Text>
        <Text style={styles.cardValue}>{dateTime}</Text>
      </Section>

      <Section style={styles.card}>
        <Text style={styles.cardLabel}>Locație</Text>
        <Text style={styles.cardValue}>
          {config.address.street}, {config.address.sector}, {config.address.city}
        </Text>
      </Section>

      <Text style={styles.small}>
        Dacă nu mai poți ajunge, te rugăm să anulezi cu cel puțin 24 de ore înainte.
      </Text>
    </BaseLayout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  p: { fontSize: 15, color: '#3d4a3a', margin: '0 0 12px' },
  small: { fontSize: 13, color: '#6b7868', margin: '12px 0 0', lineHeight: '20px' },
  card: {
    backgroundColor: '#f0f5f2',
    borderRadius: 10,
    padding: '16px 18px',
    margin: '16px 0 0',
  },
  cardLabel: { fontSize: 12, color: '#6b7868', margin: 0 },
  cardValue: { fontSize: 16, color: '#1a2018', margin: '6px 0 0', fontWeight: 500 },
}

