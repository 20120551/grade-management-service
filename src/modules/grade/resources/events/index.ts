export type EventType = 'event' | 'message' | 'notification';
export type EventStatus = 'todo' | 'processing' | 'urgent' | 'doing';
export interface NotificationTemplate {
  content: string;
  senderId: string;
  recipientIds: string[];
  type: EventType;
  status: EventStatus;
}

export * from './gradeStructureFinalized.event';
export * from './gradeTypeFinalized.event';
