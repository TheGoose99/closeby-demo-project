import { Text } from '@react-email/components'
import type { ClientConfig } from '@/types/client-config'
import { BaseLayout } from '@/lib/email/templates/BaseLayout'

type Props = {
  name: string
  config: Pick<ClientConfig, 'shortName' | 'address' | 'phoneDisplay' | 'gdpr'>
}

export function ContactAutoReplyEmail({ name, config }: Props) {
  const preview = 'Am primit mesajul tău'

  return (
    <BaseLayout preview={preview} title="Am primit mesajul tău" config={config}>
      <Text style={styles.p}>Bună ziua, {name},</Text>
      <Text style={styles.p}>Am primit mesajul tău și voi reveni cu un răspuns în maxim 24 de ore.</Text>
      <Text style={styles.p}>
        Cu respect,
        <br />
        {config.shortName}
      </Text>

      <Text style={styles.small}>
        {config.address.street}, {config.address.sector}, {config.address.city} · {config.phoneDisplay}
      </Text>
    </BaseLayout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  p: { fontSize: 15, color: '#3d4a3a', margin: '0 0 12px', lineHeight: '22px' },
  small: { fontSize: 12, color: '#a8b4a5', margin: '12px 0 0', lineHeight: '18px' },
}

