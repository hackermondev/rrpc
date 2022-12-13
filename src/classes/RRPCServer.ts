import { Redis } from 'ioredis';
import { RRPCBase } from './Base';
import { ICreateChannMessage } from '../types/messages';
import { Channel } from './Channel';

export declare interface RRPCServer {
    on(event: 'connection', listener: (channel: Channel) => void): this;
}

export class RRPCServer extends RRPCBase {
    constructor(serverName: string, redis: Redis, baseName = 'rrpc') {
        super(baseName, redis);
        this.server_name = serverName;
    }

    async run() {
        const Channel0 = `${this.name}/${this.server_name}/channel0`;
        this.redis.subscribe(Channel0);
        this.redis.on('message', (channel, message) => {
            if (channel != Channel0) return;

            // The client requests a new channel
            // Connection details are sent to the server in channel0
            /*
                {
                    "op": "createchan",
                    "name": String, // name of rpc server name (our name, not required)
                    "id": String, // Connection ID, generated by client
                    "type": "oneway" | "stream" // Channel connection type. 
                        oneway = Simple one message send/recieve then channel end
                        stream = Keep connection open and send and recieve anytime until channel ends
                }
            */

            const data = this.parseIncomingMessage(Buffer.from(message));
            this.debug(channel, data);
            if (data.op != 'createchan') return;

            this.debug('creating channel', data);
            const chann = new Channel((data as ICreateChannMessage).type, this, 'server');
            chann.connect(data as ICreateChannMessage);

            this.emit('connection', chann);
        });
    }
}