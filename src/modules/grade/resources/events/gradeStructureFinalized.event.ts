export class GradeStructureFinalizedEvent {
  senderId: string;
  recipientIds: string[];
  content: string;
  channel: string;
  type: string;
  redirectEndpoint: string;
  name = GradeStructureFinalizedEvent.name;

  constructor(
    senderId: string,
    recipientIds: string[],
    content: string,
    gradeStructureId: string,
    type: string,
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
