import { HealthCheck } from 'testcontainers/dist/docker/types';
import { GenericContainer } from 'testcontainers';

export async function getRedisContainer() {
  const redisHealthCheck: HealthCheck = {
    test: 'redis-cli set cat-count 10',
    interval: 1000,
    startPeriod: 1000,
  };

  return await new GenericContainer('bitnami/redis:6.2.6-debian-10-r191')
    .withExposedPorts(6379)
    .withHealthCheck(redisHealthCheck)
    .withEnv('BITNAMI_DEBUG', 'false')
    .withEnv('REDIS_REPLICATION_MODE', 'master')
    .withEnv('ALLOW_EMPTY_PASSWORD', 'yes')
    .withEnv('REDIS_TLS_ENABLED', 'no')
    .withEnv('REDIS_PORT', `6379`)

    .withDefaultLogDriver()
    .start();
}
