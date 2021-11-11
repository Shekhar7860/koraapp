import API_URL from '../../../env.constants';
import io from 'socket.io-client';
import {
  setLiveActionNotification,
  setNotification,
  setNotificationTyping,
  setNotificationStatus,
  setTypingSubscribe,
} from '../redux/actions/notifications.action';
import {presenceStart} from '../../shared/redux/actions/home.action';
import {startLaterSync} from '../../shared/redux/actions/syncwithserver.action';
import {store} from '../redux/store';

class WebsocketService {
  _interval;
  presence = API_URL.presenceServer;
  sio;
  webSocketReconnected = false;
  createSocketConnection = (userId, sToken) => {
    const _self = this;
    const _param = {
      // transports: ['xhr-polling', 'websocket'],
      transports: ['websocket'],
      'force new connection': true,
      reconnect: false,
      'connect timeout': 15000,
      'reconnection delay': 5000, // reconnect delay 2s
      'max reconnection attempts': 'Infinity',
      forceNew: true,
      reconnection: false,
      timeout: 15000,
      reconnectionDelay: 5000, // reconnect delay 2s
      reconnectionAttempts: 'Infinity',
      query:
        'userid=' +
        userId +
        '&channels=7&sToken=' +
        sToken +
        '&rnd=' +
        new Date().getTime(),
    };

    if (io) {
      try {
        _self.sio = io.connect(this.presence, _param);
        _self.sio.on('connect', (msg) => {
          this.startSendingPingPong();
          console.log('Websocket connected..');
          if (this.webSocketReconnected) {
            this.webSocketReconnected = false;
            let params = {
              shouldSendUpdate: false,
            };
            store.dispatch(startLaterSync(params));
          }
        });
        _self.sio.on('reconnect', () => {
          console.log('ws reconnect');
          this.webSocketReconnected = true;
        });
        _self.sio.on('recconnecting', () => {
          console.log('ws reconnecting');
          this.webSocketReconnected = true;
        });
        _self.sio.on('status', (msg) => {
          // store.subscribe(() => {
          //     console.log(store.getState());
          // });
          // store.dispatch(setNotificationStatus(msg));
          // console.log('Received status');
        });
        _self.sio.on('disconnect', () => {
          this.webSocketReconnected = true;
          this.stopSendingPingPong();
          console.log('Websocket disconnected..');
          store.dispatch(presenceStart());
        });
        _self.sio.on('statusall', () => {
          console.log('Received statusall');
        });
        _self.sio.on('notification', (msg) => {
          //console.log('Notification', JSON.stringify(msg));
          store.dispatch(setNotification(msg));
        });
        _self.sio?.on('typing', (msg) => {
          console.log('Received typing');
          store.dispatch(setNotificationTyping(msg));
        });
        _self.sio?.on('live', (msg) => {
          store.dispatch(setLiveActionNotification(msg));

          // store.dispatch(setNotificationTyping(msg));
        });
        _self.sio.on('typingSubscribe', (msg) => {
          console.log('Received typingSubscribe');
          store.dispatch(setTypingSubscribe(msg));
        });
        _self.sio.on('ksmp', () => {
          console.log('Received ksmp');
        });
      } catch (e) {
        console.log('exception in socket connection', e.message);
        return null;
      }
      return _self.sio;
    }
    return null;
  };
  startSendingPingPong() {
    this._interval = setInterval(() => {
      // console.log('Sending ping');
      this.sio?.emit('pong from the client');
    }, 10000);
  }
  stopSendingPingPong() {
    // console.log('Stopped Sending ping');
    clearInterval(this._interval);
  }
  disconnect() {
    if (this.sio && this.sio.disconnect) {
      this.sio.disconnect();
    }
    this.sio = null;
  }
  isConnected() {
    if (this.sio && this.sio.connected) {
      return true;
    } else return false;
  }
  disconnectUser(obj) {
    if (obj && obj.disconnect) {
      obj.disconnect();
      obj = null;
    }
  }

  sendDataToSocket(type, subscriptions) {
    if (type && type === 'typingSubscribe') {
      this.sio?.emit('typingSubscribe', {
        args: [
          {
            resourceIds: subscriptions,
          },
        ],
      });
    } else if (type && type === 'typing') {
      this.sio?.emit('typing', {
        args: [subscriptions],
      });
    }
  }
}
export default new WebsocketService();
