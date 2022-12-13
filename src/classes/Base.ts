import RedisClient from 'ioredis';
import type { Redis } from 'ioredis';

import { randomUUID } from 'crypto';
import { EventEmitter } from 'stream';
import { Message } from '../types/messages';

if (typeof jest !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    RedisClient = require('ioredis-mock');
}

export class RRPCBase extends EventEmitter {
    public readonly name: string;
    public readonly redis: Redis;
    public readonly redis2: Redis;
    public readonly id: string;
    public server_name: string;
    public debug: (...data: unknown[]) => void;

    constructor(name: string, redisClient: Redis) {
        super();
        this.server_name = '';
        this.name = name;
        this.redis = redisClient;
        this.redis2 = new RedisClient(this.redis.options);
        this.id = randomUUID();

        // By default, the debug function is empty. If you want to log debug, redeclare it and log to console
        this.debug = () => {};
    }

    parseOutgoingMessage(data: object) {
        return JSON.stringify(data);
    }

    parseIncomingMessage(data: Buffer): Message {
        return JSON.parse(data.toString('utf8'));
    }
}