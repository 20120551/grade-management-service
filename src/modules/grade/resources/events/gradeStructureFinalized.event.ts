import { EventStatus, EventType, NotificationTemplate } from '.';

export class GradeStructureFinalizedEvent implements NotificationTemplate {
  senderId: string;
  recipientIds: string[];
  content: string;
  channel: string;
  type: EventType;
  redirectEndpoint: string;
  isPublished: boolean = false;
  status: EventStatus = 'processing';
  name = GradeStructureFinalizedEvent.name;

  constructor(
    senderId: string,
    recipientIds: string[],
    content: string,
    gradeStructureId: string,
    type: EventType,
    redirectEndpoint: string,
  ) {
    this.senderId = senderId;
    this.recipientIds = recipientIds;
    this.content = content;
    this.channel = `${this.name}-${gradeStructureId}`;
    this.type = type;
    this.redirectEndpoint = redirectEndpoint;
  }
}
