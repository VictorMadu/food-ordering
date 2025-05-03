import { CloseStatus } from './close-status';
import { PongMessage } from './pong-message';
import { TextMessage } from './text-message';
import { WebSocketSession } from './web-socket-session';
import { WebSocketServer, WebSocket } from 'ws';
import { Socket } from 'net';
import { IncomingMessage, Server } from 'http';
import { WebSocketMessage } from './web-socket-message';

const session = Symbol();

export abstract class AbstractWebSocketHandler {
private static pendingInits: AbstractWebSocketHandler[] = [];

  static init(server: Server) {
    for (let i = 0; i < AbstractWebSocketHandler.pendingInits.length; i++) {
      AbstractWebSocketHandler.pendingInits[i].handleInit(server);
    }

    AbstractWebSocketHandler.pendingInits = [];
  }

  private readonly path: string;
  private readonly wsServer: WebSocketServer;

  constructor(path: string) {
    if (path == null) throw new Error('Path required');

    this.path = path.charAt(0) === '/' ? path : '/' + path;
    this.wsServer = new WebSocketServer({ noServer: true });

    AbstractWebSocketHandler.pendingInits.push(this);
  }

  handleInit(server: Server) {
    server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
      const [pathName, queryParameters] = parseUrl(request.url);

      if (this.path === pathName) {
        this.wsServer.handleUpgrade(request, socket, head, (ws) => {
          this.wsServer.emit('connection', ws, request, queryParameters);
        });
      }
    });

    this.wsServer.on(
      'connection',
      (ws: WebSocket, _: object, queryParameters: Map<string, string[]>) => {
        ws[session] = new WebSocketSession(ws);

        ws.on('close', (code, reason) => {
          wrapMethodForErrorAndCall(() =>
            this?.afterConnectionClosed(
              ws[session],
              new CloseStatus(code, reason.toString('utf-8')),
            ),
          );
        });

        ws.on('message', (data, isBinary) => {
          const closeStatus = CloseStatus.NOT_ACCEPTABLE.withReason(
            'Binary messages not supported',
          );

          if (isBinary) {
            ws.close(closeStatus.getCode(), closeStatus.getReason());
          } else {
            wrapMethodForErrorAndCall(() =>
              this?.handleMessage(ws[session], new TextMessage(data.toString('utf-8'))),
            );
          }
        });

        ws.on('pong', (data) => {
          wrapMethodForErrorAndCall(() =>
            this?.handleMessage(ws[session], new PongMessage(data.toString('utf-8'))),
          );
        });

        wrapMethodForErrorAndCall(() =>
          this?.afterConnectionEstablished(ws[session], queryParameters),
        );
      },
    );
  }

  handleMessage(session: WebSocketSession, message: WebSocketMessage): void | Promise<void> {
    if (message instanceof TextMessage) {
      this.handleTextMessage(session, message);
    } else if (message instanceof PongMessage) {
      this.handlePongMessage(session, message);
    } else {
      throw new Error('Unexpected message ty[e');
    }
  }

  abstract afterConnectionEstablished(
    session: WebSocketSession,
    queryParameters: Map<string, string | string[]>,
  ): void | Promise<void>;
  abstract handleTextMessage(session: WebSocketSession, message: TextMessage): void | Promise<void>;
  abstract handlePongMessage(session: WebSocketSession, message: PongMessage): void | Promise<void>;
  abstract afterConnectionClosed(
    session: WebSocketSession,
    status: CloseStatus,
  ): void | Promise<void>;
}

function parseUrl(urlString: string): [string, Map<string, string | string[]>] {
  const url = new URL(urlString, 'http://example.com');

  const baseUrl = url.pathname;

  const params = new URLSearchParams(url.search);
  const queryParameters = new Map<string, string | string[]>();

  let prev: string | string[] | undefined = undefined;

  for (const [key, value] of params.entries()) {
    prev = queryParameters.get(key);

    if (prev != null) {
      if (typeof prev === 'string') {
        queryParameters.set(key, [prev, value]);
      } else {
        prev.push(value);
      }
    } else {
      queryParameters.set(key, value);
    }
  }

  return [baseUrl, queryParameters];
}

async function wrapMethodForErrorAndCall(fn?: () => void | Promise<void>) {
  try {
    await fn();
  } catch (error) {}
}
