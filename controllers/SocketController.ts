import ws from 'ws';
import DialogController, { IDialogCreate } from './DialogController';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import * as WebSocket from 'ws';
import Dialog from '../models/Dialog';
import WSError from '../errors/WSError';
import UserDTO from '../dtos/UserDTO';

export enum MessageEvents {
  CONNECTION = 'connection',
  MESSAGE = 'message',
  CREATE_DIALOG = 'createDialog',
  ERROR = 'error',
  NOTIFY = 'notify'
}

export interface IMessageWithoutId {
  text: string;
  user: string;
  dialogId: string;
  event: MessageEvents;
}

export interface IBaseMessage {
  token: string;
  event: MessageEvents;
}

export interface ISocket {
  id: string;
  dialogs: string[];
}

const checkUser = (token: string): UserDTO => {
  try {
    if (!token) {
      throw WSError.unauthorized();
    }

    const decodedData: any = jwt.verify(token, config.secret);

    return decodedData;
  } catch (e) {
    throw WSError.unauthorized();
  }
}

export const wss = new ws.Server({
  port: 4000,
}, () => console.log(`Websocket was started on port: ${4000}`));

const broadCastMessage = <T>(id: string, message: T) => {
  wss.clients.forEach((client: any) => {
    if (client.id === id) {
      client.send(JSON.stringify(message));
    }

    if (client.dialogs?.includes(id)) {
      client.send(JSON.stringify(message));
    }
  })
}

const getDialogsIds = async (userId: string) => {
  const dialogs = await Dialog.find({ users: userId });
  return dialogs.map(it => it.id);
}

export const implementDialogIdIF = async (dialogId: string, currentUserId: string, message: string) => {
  const dialogs = await Dialog.find({ users: currentUserId });
  const needDialog = dialogs.find(it => Boolean(it.users.find(it => it.toString() !== currentUserId)));
  const secondUser = needDialog?.users.find(it => it.toString() !== currentUserId)?.toString();

  if (secondUser) {
    let client: any;
    wss.clients.forEach((it: any) => {
      if (it.id === secondUser) {
        client = it;
      }
    });

    if (client) {
      client.dialogs = [...(client.dialogs || []), dialogId];
      client.send(message)
    }
  }
}

wss.on('connection', async (ws: WebSocket & ISocket) => {
  ws.on('error', console.error);

  ws.on(MessageEvents.MESSAGE, async (message: string) => {
    try {
      const { token, event } = JSON.parse(message) as IBaseMessage;

      const decodedData: any = checkUser(token);
      let dataMessage;

      switch (event) {
        case MessageEvents.MESSAGE:
          dataMessage = JSON.parse(message) as IMessageWithoutId;
          const msgFromDB = await DialogController.createMessage({ ...dataMessage, user: decodedData }) as any;

          broadCastMessage(dataMessage.dialogId, { ...msgFromDB, event: MessageEvents.MESSAGE });
          break;
        case MessageEvents.CONNECTION:
          ws.id = decodedData.id;
          const ids = await getDialogsIds(ws.id);
          ws.dialogs = ids || [];
          broadCastMessage(ws.id, { text: 'Success' })
          break;
      }
    } catch (e) {
      if (e instanceof WSError) {
        broadCastMessage(ws.id, { event: e.event, message: e.message, status: e.status });
      } else {
        broadCastMessage(ws.id, { event: MessageEvents.ERROR, message: 'Server error', status: 500 });
      }
    }

  });
});
