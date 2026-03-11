/**
 * WebSocket server: attach to HTTP server, keep client set, broadcast audio frames.
 * Control: { type: 'start' } | { type: 'pause' } from client.
 */
const WebSocket = require('ws');

const clients = new Set();
let broadcastControlFn = null;

function attach(server) {
  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'start' && broadcastControlFn) broadcastControlFn('start', msg.file);
        if (msg.type === 'pause' && broadcastControlFn) broadcastControlFn('pause');
      } catch (_) {}
    });
    ws.on('close', () => clients.delete(ws));
  });
}

function setBroadcastControl(fn) {
  broadcastControlFn = fn;
}

function broadcast(payload) {
  const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
  clients.forEach(c => {
    if (c.readyState === 1) c.send(msg);
  });
}

module.exports = function (server) {
  attach(server);
};
module.exports.broadcast = broadcast;
module.exports.setBroadcastControl = setBroadcastControl;
