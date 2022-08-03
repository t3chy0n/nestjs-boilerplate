import { ConsumerConfig, Kafka, Partitioners, ProducerConfig } from 'kafkajs';
import RxConsumer from '@libs/messaging/drivers/kafka/rx/consumer.rx';
import { RxProducer } from '@libs/messaging/drivers/kafka/rx/producer.rx';
import { RxAdmin } from '@libs/messaging/drivers/kafka/rx/admin.rx';

/**
 * Connection to Kafka server.
 */
export class RxConnection {
  private _producer: RxProducer;
  private _consumer: RxConsumer;
  private _admin: RxAdmin;

  /**
   * Class constructor
   *
   * @param connection
   * @param consumerConfig
   * @param produerConfig
   */
  constructor(
    public readonly connection: Kafka,
    private readonly consumerConfig: ConsumerConfig,
    private readonly produerConfig: ProducerConfig,
  ) {}

  get producer(): RxProducer {
    if (!this._producer) {
      this._producer = new RxProducer(
        this.connection.producer({
          ...this.produerConfig,
          createPartitioner: Partitioners.DefaultPartitioner,
        }),
        this,
      );
    }
    return this._producer;
  }

  get consumer(): RxConsumer {
    if (!this._consumer) {
      this._consumer = new RxConsumer(
        this.connection.consumer(this.consumerConfig),
        this,
      );
    }
    return this._consumer;
  }

  get admin(): RxConsumer {
    if (!this._admin) {
      this._admin = new RxAdmin(
        this.connection.admin(this.consumerConfig),
        this,
      );
    }
    return this._consumer;
  }
}

export default RxConnection;
