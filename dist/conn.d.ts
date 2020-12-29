import mineflayer from "mineflayer";
import mc from "minecraft-protocol";
interface Packet {
    data: any;
    name: string;
    state?: string;
}
export declare class Conn {
    bot: mineflayer.Bot;
    pclient?: mc.Client;
    metadata: {
        [entityId: number]: {
            key: number;
            type: number;
            value: any;
        };
    };
    excludedPacketNames: string[];
    write: (name: string, data: any) => void;
    constructor(botOptions: mineflayer.BotOptions, relayExcludedPacketNames?: string[]);
    sendPackets(pclient: mc.Client): void;
    generatePackets(): Packet[];
    link(pclient: mc.Client): void;
    unlink(): void;
    writeIf(name: string, data: any): void;
}
export {};