import * as conn from './conn.js';
import * as mc from 'minecraft-protocol';
class ConnContainer {
    constructor(connection, password) {
        this.connection = connection;
        this.password = password || '';
    }
    changePassword(password) {
        this.password = password;
    }
    verifyPassword(password) {
        return this.password === password;
    }
}
export class ProxyServer {
    constructor(options, requireAdminPassword) {
        this.connList = [];
        this.userList = [];
        this.requireAdminPassword = requireAdminPassword || false;
        this.server = mc.createServer(options);
        this.server.on('login', (pclient) => {
            this.handleUser(pclient);
        });
        console.log('proxyServer UP');
    }
    handleUser(pclient) {
        pclient.write('login', { entityId: 9001, levelType: 'default' });
        pclient.write('position', { x: 0, y: 0, z: 0 });
        this.sendMessage(pclient, 'welcome to mcproxy, a project by Rob9315', { suggestcommand: ',connect <connName> <connPassword>' });
        this.sendMessage(pclient, `to see all commands, type ',help'`);
        pclient.on('packet', (data, meta) => {
            if (meta.name == 'chat') {
                let msg = data.message;
                let splitmsg = msg.split(' ');
                splitmsg.forEach((value) => (value = value.toLowerCase()));
                switch (splitmsg.length > 0) {
                    case false:
                        this.sendMessage(pclient, 'what');
                        this.sendMessage(pclient, 'how');
                        break;
                    case splitmsg[0] === ',help':
                        this.sendMessage(pclient, `visit https://github.com/rob9315/mcproxy/blobs/master/commands.md for all commands`);
                        break;
                    case splitmsg[0] === ',connect':
                        if (splitmsg.length === 3) {
                            if (this.connList[splitmsg[1]]?.verifyPassword(splitmsg[2])) {
                                this.userList[pclient]?.unlink();
                                this.userList[pclient] = this.connList[splitmsg[1]].connection;
                                this.userList[pclient].sendPackets(pclient);
                                this.userList[pclient].link(pclient);
                                this.sendMessage(pclient, 'you should be connected');
                            }
                            else {
                                this.sendMessage(pclient, `wrong password for Connection '${splitmsg[1]}, or it does not exist'`);
                            }
                        }
                        else {
                            this.sendMessage(pclient, `wrong amount of parameters specified for ,connect`, { suggestcommand: ',help' });
                        }
                        break;
                    case splitmsg[0] === ',conn':
                        switch (splitmsg.length > 1) {
                            case false:
                                this.sendMessage(pclient, 'wrong amount of parameters specified for ,conn', { suggestcommand: ',help' });
                                break;
                            case splitmsg[1] === 'new':
                                if (splitmsg.length === 5 && splitmsg[2].split(':').length === 2 && !isNaN(+splitmsg[2].split(':')[1])) {
                                    this.connList[splitmsg[3]] = new ConnContainer(this.newConn(pclient, { username: pclient.username, host: splitmsg[2].split(':')[0], port: +splitmsg[2].split(':')[1] }, false, ['keep_alive', 'chat']), splitmsg[4]);
                                    this.sendMessage(pclient, `Connection '${splitmsg[3]}' has been created`);
                                }
                                else {
                                    this.sendMessage(pclient, 'wrong use of ,conn new', { suggestcommand: ',help' });
                                }
                                break;
                            case splitmsg[1] === 'list':
                                this.sendMessage(pclient, `here is a list of all Connections:`);
                                for (const key in this.connList) {
                                    if (Object.prototype.hasOwnProperty.call(this.connList, key)) {
                                        this.sendMessage(pclient, `${key}`);
                                    }
                                }
                                break;
                            case splitmsg[1] === 'change':
                                if (splitmsg.length === 6 && this.connList[splitmsg[2]]?.verifyPassword(splitmsg[3])) {
                                    if (splitmsg[2] !== splitmsg[4]) {
                                        this.connList[splitmsg[4]] = this.connList[splitmsg[2]];
                                        delete this.connList[splitmsg[2]];
                                    }
                                    if (splitmsg[3] !== splitmsg[5]) {
                                        this.connList[splitmsg[4]].changePassword(splitmsg[5]);
                                    }
                                }
                                break;
                            case splitmsg[1] === 'delete':
                                if (splitmsg.length === 4 && this.connList[splitmsg[2]]?.verifyPassword(splitmsg[3])) {
                                    this.connList[splitmsg[2]].connection.disconnect();
                                    delete this.connList[splitmsg[2]];
                                }
                                break;
                            case splitmsg[1] === 'restart':
                                break;
                            case splitmsg[1] === 'option':
                                switch (splitmsg.length === 3) {
                                    case false:
                                        this.sendMessage(pclient, 'no6');
                                        break;
                                    case splitmsg[2] === 'reconnect':
                                        break;
                                    case splitmsg[2] === '2b2tnotification':
                                        break;
                                    case true:
                                        this.sendMessage(pclient, 'no7');
                                        break;
                                }
                                break;
                            case true:
                                this.sendMessage(pclient, 'no8');
                                break;
                        }
                        break;
                    case splitmsg[0] === ',this':
                        switch (splitmsg.length > 1) {
                            case false:
                                this.sendMessage(pclient, 'no9');
                                break;
                            case splitmsg[1] === 'change':
                                break;
                            case splitmsg[1] === 'delete':
                                break;
                            case splitmsg[1] === 'restart':
                                break;
                            case true:
                                this.sendMessage(pclient, 'no10');
                                break;
                        }
                        break;
                    case splitmsg[0] === ',shutdown':
                        break;
                    case true:
                        this.sendMessage(pclient, msg, { sender: pclient.username });
                        break;
                }
            }
        });
    }
    newConn(pclient, clientOptions, instantConnect, excludedPacketNames) {
        const connection = new conn.Conn(clientOptions, excludedPacketNames);
        if (instantConnect) {
            connection.bot.once('spawn', () => {
                connection.sendPackets(pclient);
                connection.link(pclient);
            });
        }
        return connection;
    }
    sendMessage(pclient, message, extra) {
        pclient.write('chat', {
            message: `{"translate":"chat.type.text","with":[{"insertion":"mcproxy","clickEvent":{"action":"suggest_command","value":"${extra?.suggestcommand || ''}"},"hoverEvent":{"action":"show_entity","value":{"text":"{name:\\"Rob9315\\",id:\\"the creator\\"}"}},"text":"${extra?.sender || 'mcproxy'}"},"${message}"]}`,
            position: 0,
        });
        console.log(`${extra?.sender || 'mcproxy'}>${message}`);
    }
}
//# sourceMappingURL=proxyServer.js.map