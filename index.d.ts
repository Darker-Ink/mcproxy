import mineflayer from 'mineflayer';
import mc from 'minecraft-protocol';
interface Packet {
    data: any;
    name: string;
    state?: string;
}
export declare class Conn {
    bot: mineflayer.Bot;
    pclient: mc.Client | undefined;
    packetlog: Packet[];
    metadata: {
        [entityId: number]: {
            key: number;
            type: number;
            value: any;
        };
    };
    write: (name: string, data: any) => void;
    writeRaw: (buffer: any) => void;
    writeChannel: (channel: any, params: any) => void;
    constructor(botOptions: mineflayer.BotOptions);
    sendPackets(pclient: mc.Client): void;
    generatePackets(): Packet[];
    link(pclient: mc.Client): void;
    unlink(): void;
}
export {};
//# sourceMappingURL=index.d.ts.map