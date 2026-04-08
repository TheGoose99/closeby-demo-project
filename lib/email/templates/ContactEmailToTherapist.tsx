import { Link, Section, Text } from '@react-email/components'
import type { ClientConfig } from '@/types/client-config'
import { BaseLayout } from '@/lib/email/templates/BaseLayout'
import { escapeHtml } from '@/lib/email/utils'

type Props = {
  name: string
  email: string
  message: string
  config: Pick<ClientConfig, 'gdpr' | 'shortName'>
}

export function ContactEmailToTherapist({ name, email, message, config }: Props) {
  const preview = `Mesaj nou de la ${name}`
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')

  return (
    <BaseLayout preview={preview} title="Mesaj nou de pe site" config={config}>
      <Section>
        <Text style={styles.p}>
          <strong>Nume:</strong> {name}
        </Text>
        <Text style={styles.p}>
          <strong>Email:</strong>{' '}
          <Link href={`mailto:${email}`} style={styles.link}>
            {email}
          </Link>
        </Text>
        <Text style={{ ...styles.p, marginTop: 16 }}>
          <strong>Mesaj:</strong>
        </Text>
        {/* eslint-disable-next-line react/no-danger */}
        <Text style={styles.message} dangerouslySetInnerHTML={{ __html: safeMessage }} />
      </Section>
    </BaseLayout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  p: { fontSize: 14, color: '#3d4a3a', margin: '0 0 10px', lineHeight: '20px' },
  link: { color: '#4d7a5e', textDecoration: 'underline' },
  message: {
    fontSize: 14,
    color: '#1a2018',
    backgroundColor: '#f0f5f2',
    borderRadius: 10,
    padding: '14px 16px',
    margin: '10px 0 0',
    lineHeight: '20px',
  },
}

