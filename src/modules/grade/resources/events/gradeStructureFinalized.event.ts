export class GradeStructureFinalizedEvent {
  senderId: string;
  content: string;
  channel: string;
  type: string;
  redirectEndpoint: string;
  name = GradeStructureFinalizedEvent.name;

  constructor(
    senderId: string,
    content: string,
    gradeStructureId: string,
    type: string,
    redirectEndpoint: string,
  ) {
    this.senderId = senderId;
    this.content = content;
    this.channel = `${this.name}-${gradeStructureId}`;
    this.type = type;
    this.redirectEndpoint = redirectEndpoint;
  }
}
