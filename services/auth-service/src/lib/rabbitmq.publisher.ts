import amqp, { type Channel, type ChannelModel } from "amqplib";
import { getLogger } from "@task-manager/shared/server";

const log = getLogger();

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export class RabbitMqPublisher {
  constructor(
    private readonly rabbitmqUrl: string,
    private readonly exchangeName: string
  ) {}

  async connect(): Promise<void> {
    if (channel) return;
    connection = await amqp.connect(this.rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertExchange(this.exchangeName, "topic", { durable: true });
    log.info("rabbitmq_publisher_connected", { exchange: this.exchangeName });
  }

  async publish(routingKey: string, payload: unknown): Promise<void> {
    await this.connect();
    channel!.publish(
      this.exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true, contentType: "application/json" }
    );
  }
}

let publisher: RabbitMqPublisher | null = null;

export function getRabbitMqPublisher(config: {
  rabbitmqUrl: string;
  exchangeName: string;
}): RabbitMqPublisher {
  if (!publisher) {
    publisher = new RabbitMqPublisher(config.rabbitmqUrl, config.exchangeName);
  }
  return publisher;
}
