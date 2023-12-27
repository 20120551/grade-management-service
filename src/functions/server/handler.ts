import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { bootstrap } from '../../bootstrap';

export const apiHandler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
) => {
  const app = await bootstrap();
  const server = serverlessExpress({ app });
  return server(event, context, callback);
};
