import * as mcproxy from './index.js';
let test = new mcproxy.ProxyServer({
    'online-mode': true,
    host: 'localhost',
    port: 25566,
});
test.server.on('login', (pclient) => {
    console.log(`${pclient.username} logged onto the proxyServer`);
});
//# sourceMappingURL=app.js.map