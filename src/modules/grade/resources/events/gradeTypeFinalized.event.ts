export class GradeTypeFinalizedEvent {
  senderId: string;
  recipientIds: string[];
  content: string;
  channel: string;
  type: string;
  redirectEndpoint: string;
  name = GradeTypeFinalizedEvent.name;

  constructor(
    senderId: string,
    recipientIds: string[],
    content: string,
    gradeTypeId: string,
    type: string,
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
