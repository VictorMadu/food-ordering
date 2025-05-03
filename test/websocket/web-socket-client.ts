import { Duration } from 'src/lib/duration';
import { WebSocket } from 'ws';
import { deserialize } from './deserialize';

export class EventWebSocketClient {
  private websocket: WebSocket;
  private pingHandler: () => void = () => {};
  private eventStore = new EventStore();

  constructor(private readonly url: string) {}

  async connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.websocket != null) {
        return reject(new Error('Ready called to connect websocket previously'));
      }

      this.websocket = new WebSocket(this.url);

      this.websocket.once('open', () => {
        resolve();
      });

      if (this.websocket.readyState === this.websocket.OPEN) {
        this.websocket.emit('open');
      }

      this.websocket.on('ping', () => {
        this.pingHandler();
      });


      this.websocket.on('message', (data, isBinary) => {
        const { type, payload, createdAt } = JSON.parse(data.toString());
        this.eventStore.addData(type, payload, createdAt);
      });

      //   this.websocket.on('error', (err) => {
      //     console.log(err);
      //     reject(err);
      //   });
    });
  }

  send(type: string, payload: object) {
    this.websocket.send(JSON.stringify({ type, payload }));
  }

  async on(type: string, payload: object, onOrAfter: Date, timeOut: Duration): Promise<boolean> {
    const [p, timedOut] = await this.eventStore.getOrListen(type, onOrAfter, timeOut);

    if (p != null) {
      const result = deserialize(p, payload.constructor as any);
      Object.assign(payload, result);
    }

    return timedOut;
  }

  setPingHandler(handler: () => void) {
    this.pingHandler = handler;
  }

  pong() {
    this.websocket.pong();
  }
}

class EventStore {
  private readonly store: Map<string, { payload: object; createdAt: Date }[]> = new Map();
  private readonly listeners: Map<string, Handler[]> = new Map();

  addData(event: string, payload: object, createdAt: Date) {
    let data = this.store.get(event);

    if (data != null) {
      const index = search(data.length, (i) => {
        return +data[i].createdAt < +createdAt;
      });

      data.splice(index, 0, { payload, createdAt });
    } else {
      data = [{ payload, createdAt }];
      this.store.set(event, data);
    }

    const eventListeners = this.listeners.get(event);

    if (eventListeners != null) {
      for (let i = 0; i < eventListeners.length; i++) {
        eventListeners[i](payload, createdAt);
      }
    }
  }

  async getOrListen(event: string, from: Date, timeOut: Duration): Promise<[object, boolean]> {
    return new Promise((resolve) => {
      const handler = (payload: object) => {
        resolve([payload, false]);
        this.listeners.get(event).filter((l) => l !== handler);
      };

      let eventListeners = this.listeners.get(event);
      
      if (eventListeners == null) {
        eventListeners = [handler];
        this.listeners.set(event, eventListeners);
      } else {
        eventListeners.push(handler);
      }

      let data = this.store.get(event);

      if (data != null) {
        const { payload, createdAt } = data[data.length - 1];

        if (+createdAt >= +from) {
          return resolve([payload, false]);
        }
      }

      setTimeout(() => {
        resolve([null, true]);
      }, timeOut.getInMilliSeconds());
    });
  }
}

type Handler = (payload: object, createdAt: Date) => unknown;

function search<T>(arrLength: number, check: (index: number) => boolean): number {
  let i = 0;
  let j = arrLength;
  let h: number;

  while (i <= j) {
    h = (i + j) >> 1;

    if (!check(h)) {
      i = h + 1;
    } else {
      j = h;
    }
  }

  return i;
}
