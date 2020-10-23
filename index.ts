import mc from 'minecraft-protocol';
import mineflayer from 'mineflayer';
import { loadWelcomeMap } from './loadWelcomeMap.js';

export class Address {
  host: string;
  port: number;
  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
  }
}
export class Account {
  username: string;
  password: string;
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}
export class User {
  proxyClient: mc.Client;
  constructor(proxyClient: mc.Client) {
    this.proxyClient = proxyClient;
    loadWelcomeMap(this.proxyClient);
    this.proxyClient.on('packet', (data, packetMeta) => {
      output(this, data, packetMeta);
    });
  }
}
export class BotConn {
  address: Address;
  account: Account;
  bot: mineflayer.Bot;
  client: mc.Client;
  constructor(address: Address, account: Account) {
    this.address = address;
    this.account = account;
    this.bot = mineflayer.createBot({
      username: account.username,
      password: account.password,
      host: address.host,
      port: address.port,
    });
    this.client = this.bot._client;
  }
}
export class Room {
  users: User[];
  botConns: BotConn[];
  roomID: number;
  roomPassword: string;
  constructor(roomID: number, roomPassword: string) {
    this.roomID = roomID;
    this.roomPassword = roomPassword;
    this.users = [];
    this.botConns = [];
  }
  addUser(user: User) {
    if (!(this.roomPassword == null)) {
    } else {
      this.users.push(user);
    }
  }
  addBotConn(botConn: BotConn) {
    this.botConns.push(botConn);
  }
  linkUser(user: User, botConn: BotConn) {}
}
export class Proxy {
  rooms: Room[];
  users: User[];
  botConns: BotConn[];
  host: string;
  port: number;
  proxyServer: mc.Server;
  serverOptions: mc.ServerOptions;
  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.serverOptions = {
      host: host,
      port: port,
      'online-mode': false,
      motd: 'A redirection tool, mcproxy by Rob9315',
    };
    this.rooms = [];
    this.rooms[0] = new Room(0, '');
    this.proxyServer = mc.createServer(this.serverOptions);
    this.users = [];
    this.botConns = [];

    this.proxyServer.on('login', (proxyClient) => {
      let user = new User(proxyClient);
      this.users.push(user);
      this.rooms[0].addUser(user);
    });
  }
}

export function output(object: any, data: any, packetMeta: mc.PacketMeta) {
  //!debug
  if (!(packetMeta.name == 'keep_alive') && false) {
    if (object.name) {
      console.log(object.name, packetMeta.state, packetMeta.name, data);
    } else {
      console.log(typeof object, packetMeta.state, packetMeta.name, data);
    }
  }
  if (
    packetMeta.name == 'chat' &&
    (data.message as string).includes('debugpls')
  ) {
    console.log();
  }
}
