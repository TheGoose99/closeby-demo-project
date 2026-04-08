import { Link, Section, Text } from '@react-email/components'
import type { CalBookingData } from '@/types/calcom'
import type { ClientConfig } from '@/types/client-config'
import { BaseLayout } from '@/lib/email/templates/BaseLayout'
import { formatDateTimeRo } from '@/lib/email/utils'

type Props = {
  booking: CalBookingData
  config: Pick<ClientConfig, 'address' | 'gdpr' | 'phone' | 'phoneDisplay' | 'shortName'>
}

export function BookingReminderEmail({ booking, config }: Props) {
  const attendee = booking.attendees[0]
  const dateTime = formatDateTimeRo(booking.startTime)
  const preview = `Reminder pentru ședința de mâine — ${dateTime}`

  return (
    <BaseLayout preview={preview} title="Reminder ședință — mâine" config={config}>
      <Text style={styles.p}>Bună ziua, {attendee?.name},</Text>
      <Text style={styles.p}>
        Îți amintim că mâine ai o ședință programată la <strong>{dateTime}</strong>.
      </Text>

      <Section style={styles.card}>
        <Text style={styles.cardLabel}>Locație</Text>
        <Text style={styles.cardValue}>{config.address.street}</Text>
      </Section>

      <Text style={styles.small}>
        Dacă nu mai poți ajunge, te rugăm să ne anunți cât mai curând:{' '}
        <Link href={`tel:${config.phone}`} style={styles.link}>
          {config.phoneDisplay}
        </Link>
        .
      </Text>
    </BaseLayout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  p: { fontSize: 15, color: '#3d4a3a', margin: '0 0 12px', lineHeight: '22px' },
  small: { fontSize: 13, color: '#6b7868', margin: '12px 0 0', lineHeight: '20px' },
  link: { color: '#4d7a5e', textDecoration: 'underline' },
  card: {
    backgroundColor: '#f0f5f2',
    borderRadius: 10,
    padding: '16px 18px',
    margin: '16px 0 0',
  },
  cardLabel: { fontSize: 12, color: '#6b7868', margin: 0 },
  cardValue: { fontSize: 15, color: '#1a2018', margin: '6px 0 0', fontWeight: 500 },
}

