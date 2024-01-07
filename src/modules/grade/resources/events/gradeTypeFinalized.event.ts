export class GradeTypeFinalizedEvent {
  senderId: string;
  receiverIds: string[];
  content: string;
  channel: string;
  type: string;
  redirectEndpoint: string;
  name = GradeTypeFinalizedEvent.name;

  constructor(
    senderId: string,
    receiverIds: string[],
    content: string,
    gradeTypeId: string,
    type: string,
    redirectEndpoint: string,
  ) {
    this.senderId = senderId;
    this.receiverIds = receiverIds;
    this.content = content;
    this.channel = `${this.name}-${gradeTypeId}`;
    this.type = type;
    this.redirectEndpoint = redirectEndpoint;
  }
}
