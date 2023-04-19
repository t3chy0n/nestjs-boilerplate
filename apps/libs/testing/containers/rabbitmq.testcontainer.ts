import { HealthCheck } from 'testcontainers/dist/docker/types';
import { GenericContainer } from 'testcontainers';

export async function getRedisContainer() {
  const redisHealthCheck: HealthCheck = {
    test: 'rabbitmq-diagnostics -q ping', //or c rabbitmq-diagnostics heck_port_connectivity
    interval: 1000,
    startPeriod: 1000,
  };

  return await new GenericContainer('bitnami/rabbitmq:3.10')
    .withExposedPorts(4369, 5551, 5552, 5672, 25672, 15672)
    .withHealthCheck(redisHealthCheck)
    .withEnv('BITNAMI_DEBUG', 'false')
    .withEnv('RABBITMQ_SECURE_PASSWORD', 'yes')
    .withEnv('RABBITMQ_PLUGINS', 'rabbitmq_management')

    .withDefaultLogDriver()
    .start();
}
