import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleConnect, handleDisconnect } from './handlers/connectionHandlers';
import { handleGetMessages, handleSendMessage } from './handlers/messageHandlers';
import { postToConnection } from './utils/apiGateway';
import { responseForbidden, responseOK } from './utils/constants';

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const connectionId = event.requestContext.connectionId as string;
    const routeKey = event.requestContext.routeKey as string;

    try {
        switch (routeKey) {
            case '$connect':
                return handleConnect(connectionId, event.queryStringParameters);
            case '$disconnect':
                return handleDisconnect(connectionId);
            case 'sendMessage':
                return handleSendMessage(connectionId, event.body);
            case 'getMessages':
                return handleGetMessages(connectionId, event.body);
            default:
                return responseForbidden;
        }
    } catch (e) {
        if (e instanceof Error && e.name === 'HandlerError') {
            await postToConnection(connectionId, JSON.stringify({ type: 'error', message: e.message }));
            return responseOK;
        }

        throw e;
    }
};
