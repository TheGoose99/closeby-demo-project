import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'
import type { ClientConfig } from '@/types/client-config'

type Props = {
  preview: string
  title: string
  config: Pick<ClientConfig, 'shortName' | 'gdpr'>
  children: ReactNode
}

export function BaseLayout({ preview, title, config, children }: Props) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.h1}>{title}</Heading>
          </Section>

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footer}>
            <Hr style={styles.hr} />
            <Text style={styles.footerText}>
              Date procesate de {config.gdpr.dataProcessorName} · Servere {config.gdpr.serverLocation} · GDPR compliant
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#faf8f4',
    margin: 0,
    padding: '24px 0',
    fontFamily:
      "DM Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#4d7a5e',
    padding: '28px 32px',
  },
  h1: {
    margin: 0,
    color: '#ffffff',
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 22,
    fontWeight: 500,
    lineHeight: '28px',
  },
  content: {
    padding: '24px 32px',
  },
  footer: {
    padding: '0 32px 18px',
  },
  hr: {
    borderColor: '#e4eee8',
    margin: '12px 0',
  },
  footerText: {
    fontSize: 12,
    color: '#a8b4a5',
    margin: 0,
    lineHeight: '18px',
  },
}

