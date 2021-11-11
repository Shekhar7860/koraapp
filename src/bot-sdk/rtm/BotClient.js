import API_URL from '../../../env.constants';
import axios from 'axios';
const {EventEmitter} = require('events');

const URL_VERSION = '/1.1';

export const RTM_EVENT = {
  CONNECTING: 'connecting',
  AUTHENTICATED: 'authenticated',
  ON_OPEN: 'on_open',
  ON_DISCONNECT: 'disconnect',
  ON_CLOSE: 'on_close',
  ON_ERROR: 'on_error',
  ON_MESSAGE: 'on_message',
  ON_FAILURE: 'failure',
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error',
  RECONNECTING: 'reconnecting',
  UNABLE_TO_RTM_START: 'unable_to_rtm_start',
  GET_HISTORY: 'get_history',
};

class BotClient extends EventEmitter {
  constructor(props) {
    super(props);
    this.pingInterval = 5000;
    this.receivedLastPong = false;
    this.timer = null;
    this.isConnecting = false;
    this.webSocket = null;
  }

  initialize(botInfo, customData, reWriteOptions) {
    this.baseUrl = API_URL.botServer;
    this.botInfo = botInfo;
    this.customData = customData;
    this.reWriteOptions = reWriteOptions;
  }

  connectWithJwToken(jwtToken) {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.emit(RTM_EVENT.CONNECTING);

    let jwtAuthorizationUrl =
      this.baseUrl + 'searchassistapi/oAuth/token/jwtgrant';
    let payload = {assertion: jwtToken, botInfo: this.botInfo};

    axios
      .post(jwtAuthorizationUrl, payload)
      .then((response) => {
        this.userInfo = response.data.userInfo;
        this.authorization = response.data.authorization;
        // console.log(response);
        this.getRtmUrl();
      })
      .catch((e) => {
        // console.log(e);
        this.emit(RTM_EVENT.ERROR);
      });
  }

  getRtmUrl() {
    let rtmUrl = this.baseUrl + 'searchassistapi/rtm/start';
    let payload = {botInfo: this.botInfo};

    axios
      .post(rtmUrl, payload, {
        headers: {
          Authorization:
            this.authorization.token_type +
            ' ' +
            this.authorization.accessToken,
        },
      })
      .then((response) => {
        // console.log(response);
        this.connect(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  connect(data) {
    let url = data.url;
    let wssUrl = url.replace('ws://dummy.com:80/', 'wss://qa.findly.ai/');
    var ws = new WebSocket(wssUrl);

    ws.onopen = () => {
      this.emit(RTM_EVENT.ON_OPEN);
      this.setTimer();
    };

    ws.onmessage = (e) => {
      let data = JSON.parse(e.data);
      switch (data.type) {
        case 'pong':
          this.receivedLastPong = true;
          break;
        default:
          console.log(RTM_EVENT.ON_MESSAGE, e.data);
          this.emit(RTM_EVENT.ON_MESSAGE, e.data);
          break;
      }
    };

    ws.onerror = (e) => {
      this.emit(RTM_EVENT.ON_ERROR, e.message);
      console.log(RTM_EVENT.ON_ERROR, e.message, e.reason);
    };

    ws.onclose = (e) => {
      this.emit(RTM_EVENT.ON_CLOSE, e.reason);
      console.log(RTM_EVENT.ON_CLOSE, e.code, e.reason);
    };

    this.webSocket = ws;
  }

  getBotHistory() {
    if (
      !this.isConnecting ||
      !this.botInfo.taskBotId ||
      !this.authorization ||
      !this.authorization.token_type ||
      !this.authorization.accessToken
    ) {
      return false;
    }

    let rtmUrl = this.baseUrl + '/api' + URL_VERSION + '/botmessages/rtm';
    axios
      .get(rtmUrl, {
        params: {
          botId: this.botInfo.taskBotId,
          limit: 40,
          offset: 0,
          forward: true,
        },
        headers: {
          Authorization:
            this.authorization.token_type +
            ' ' +
            this.authorization.accessToken,
        },
      })
      .then((response) => {
        //  console.log('Success-----------response-------------');
        //console.log(response.data.messages);
        this.emit(RTM_EVENT.GET_HISTORY, response, this.botInfo);
        //console.log('-----------response end-------------');

        // this.connect(response.data);
      })
      .catch((e) => {
        //console.log('ee-----------response-------------');
        console.log(e);
        // console.log('ee-----------response end-------------');
      });
  }

  setTimer() {
    let ws = this.webSocket;
    this.timer = setInterval(() => {
      if (ws.readyState == WebSocket.OPEN) {
        this.receivedLastPong = false;
        this.send({type: 'ping'});
      } else if (
        ws.readyState == WebSocket.CLOSED ||
        ws.readyState == WebSocket.CLOSING ||
        this.receivedLastPong == false
      ) {
        clearInterval(this.timer);
      }
    }, this.pingInterval);
  }

  send(message, messageHandler) {
    switch (this.webSocket?.readyState) {
      case WebSocket.OPEN:
        this.webSocket.send(JSON.stringify(message));
        // messageHandler('success');
        break;
      default:
        var err = 'ws not connected or reconnecting, unable to send message';
        // messageHandler(new Error(err));
        break;
    }
  }

  getBotAccessToken() {
    return this.authorization?.accessToken;
  }
}

export default BotClient;
