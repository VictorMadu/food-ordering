import { Expose } from 'class-transformer';
import { Duration } from 'src/lib/duration';
import { sleep } from 'src/lib/sleep';
import { EventWebSocketClient } from 'test/websocket/web-socket-client';

describe('WebSocket', () => {
  test('WebSocket', async () => {
    const webSocketClient = new EventWebSocketClient('ws://localhost:8080?me=you&me=her');

    await webSocketClient.connect();

    webSocketClient.setPingHandler(() => {
      webSocketClient.pong();
    });

    const now = new Date();
    webSocketClient.send('send_message', { message: 'me' });

    const message = Object.create(Message.prototype);
    const c = await webSocketClient.on('sent_message', message, now, Duration.ofHours(3));
    console.log(c);

    while (true) {
      await sleep(200 * 1000);
    }
  });
});

class Message {
  @Expose()
  message: string;
}
