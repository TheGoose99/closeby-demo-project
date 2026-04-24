export type CalEventType =
  | 'BOOKING_CREATED'
  | 'BOOKING_REQUESTED'
  | 'BOOKING_RESCHEDULED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CONFIRMED'

export interface CalAttendee {
  name: string
  email: string
  timeZone: string
  language: { locale: string }
  phoneNumber?: string
}

export interface CalBookingData {
  uid: string
  title: string
  startTime: string
  endTime: string
  attendees: CalAttendee[]
  organizer: { name: string; email: string; timeZone: string; username?: string }
  location?: string
  description?: string
  metadata?: Record<string, string>
  responses?: {
    attendeePhoneNumber?: string
    [key: string]: unknown
  }
}

export interface CalWebhookPayload {
  triggerEvent: CalEventType
  createdAt: string
  payload: CalBookingData
}
