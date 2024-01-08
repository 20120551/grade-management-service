import { EventStatus, EventType, NotificationTemplate } from '.';

export class GradeTypeFinalizedEvent implements NotificationTemplate {
  senderId: string;
  recipientIds: string[];
  content: string;
  channel: string;
  type: EventType;
  redirectEndpoint: string;
  isPublished: boolean = false;
  status: EventStatus = 'processing';
  name = GradeTypeFinalizedEvent.name;

  constructor(
    senderId: string,
    recipientIds: string[],
    content: string,
    gradeTypeId: string,
    type: EventType,
    redirectEndpoint: string,
  ) {
    this.senderId = senderId;
    this.recipientIds = recipientIds;
    this.content = content;
    this.channel = `${this.name}-${gradeTypeId}`;
    this.type = type;
    this.redirectEndpoint = redirectEndpoint;
  }
}
