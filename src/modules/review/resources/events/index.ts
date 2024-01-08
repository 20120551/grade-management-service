export type EventType = 'event' | 'message' | 'notification';
export type EventStatus = 'todo' | 'processing' | 'urgent' | 'doing';
export interface NotificationTemplate {
  senderId: string;
  recipientIds: string[];
  type: EventType;
  title: string;
  redirectEndpoint: string;
  content: string;
  status: EventStatus;
  isPublished: false;
}
