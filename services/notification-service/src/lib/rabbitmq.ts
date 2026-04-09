import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";
import { getLogger } from "@task-manager/shared/server";

const log = getLogger();

type RabbitConfig = {
  url: string;
  exchange: string;
  queue: string;
  retryQueue: string;
  deadQueue: string;
  retryDelayMs: number;
};

export class RabbitMqClient {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(private readonly config: RabbitConfig) {}

  async connect(): Promise<Channel> {
    if (this.channel) return this.channel;
    this.connection = await amqp.connect(this.config.url);
    const nextChannel = await this.connection.createChannel();
    this.channel = nextChannel;

    await nextChannel.assertExchange(this.config.exchange, "topic", { durable: true });
    await nextChannel.assertQueue(this.config.deadQueue, { durable: true });
    await nextChannel.assertQueue(this.config.retryQueue, {
      durable: true,
      deadLetterExchange: this.config.exchange,
      deadLetterRoutingKey: "#",
      messageTtl: this.config.retryDelayMs,
    });
    await nextChannel.assertQueue(this.config.queue, { durable: true });
    await nextChannel.bindQueue(this.config.queue, this.config.exchange, "user.registered");
    await nextChannel.bindQueue(this.config.queue, this.config.exchange, "todo.created");

    log.info("notification_rabbitmq_connected", {
      exchange: this.config.exchange,
      queue: this.config.queue,
    });

    return nextChannel;
  }

  async consume(onMessage: (msg: ConsumeMessage, channel: Channel) => Promise<void>): Promise<void> {
    const channel = await this.connect();
    await channel.consume(
      this.config.queue,
      async (msg) => {
        if (!msg) return;
        await onMessage(msg, channel);
      },
      { noAck: false }
    );
  }

  async sendToRetry(rawMessage: Buffer, retryCount: number): Promise<void> {
    const channel = await this.connect();
    channel.sendToQueue(this.config.retryQueue, rawMessage, {
      persistent: true,
      contentType: "application/json",
      headers: { "x-retry-count": retryCount },
    });
  }

  async sendToDead(rawMessage: Buffer, reason: string): Promise<void> {
    const channel = await this.connect();
    channel.sendToQueue(this.config.deadQueue, rawMessage, {
      persistent: true,
      contentType: "application/json",
      headers: { "x-failure-reason": reason },
    });
  }
}

let rabbitMqClient: RabbitMqClient | null = null;

export function getRabbitMqClient(config: RabbitConfig): RabbitMqClient {
  if (!rabbitMqClient) {
    rabbitMqClient = new RabbitMqClient(config);
  }
  return rabbitMqClient;
}
