import Sockette from 'sockette';

const SocketListener = function({
  url,
  maxAttempts = 10,
  timeout = 5e3,
  payloadField = 'payload' }) {

  let listeners = {};
  const execute = (name, ...params) => {
    if (listeners[name] != null) {
      listeners[name].forEach(callback => callback(...params));
    }
  };
  const ws = new Sockette(url, {
    timeout,
    maxAttempts,
    onmessage: e => {
      let message;
      try {
        message = JSON.parse(e.data);
      } catch(e) {
        // do nothing
      }
      if (Array.isArray(message)) {
        message.forEach(msg => execute('message', msg.topic, msg[payloadField]))
      } else {
        execute('message', message.topic, message[payloadField]);
      }
    },
    onerror: e => {
      console.log('connet error', e)
    },
    onmaximum: e => {
      console.log('connet error', e)
    },
    onreconnect: e => execute('reconnect'),
    onclose: e => execute('close'),
    onopen: e => execute('open')
  });

  const obj = {
    on(name, callback) {
      if (listeners[name] == null) {
        listeners[name] = [];
      }
      listeners[name].push(callback);
      return obj;
    },
    off(name, callback) {
      if (listeners[name] != null) {
        listeners[name] = listeners[name].filter(current => current !== callback);
      }
      return obj;
    },
    close() {
      listeners = {};
      ws.close();
      return obj;
    },
    send(str) {
      ws.send(str);
      return obj;
    }
  };

  return obj;
};

export default SocketListener;