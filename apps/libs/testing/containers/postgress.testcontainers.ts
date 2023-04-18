import { GenericContainer } from 'testcontainers';
import { HealthCheck } from 'testcontainers/dist/docker/types';

export async function getPostgresContainer(port) {
  const postgressHealthCheck: HealthCheck = {
    test: 'pgsql -c "select 1"',
    interval: 1000,
    startPeriod: 1000,
  };

  return await new GenericContainer('bitnami/postgresql:14.2.0-debian-10-r58')
    .withExposedPorts(port)
    .withHealthCheck(postgressHealthCheck)
    .withEnv('RABBITMQ_SECURE_PASSWORD', 'true')
    .withEnv('POSTGRESQL_PORT_NUMBER', `${port}`)
    .withEnv('POSTGRESQL_PORT_NUMBER', `${port}`)
    .withEnv('POSTGRESQL_VOLUME_DIR', '/bitnami/postgresql')
    .withEnv('PGDATA', '/bitnami/postgresql/data')
    .withEnv('POSTGRES_USER', 'root')
    .withEnv('POSTGRES_POSTGRES_PASSWORD', 'admin')
    .withEnv('POSTGRES_PASSWORD', 'admin')
    .withEnv('POSTGRES_DB', 'boilerplate')
    .withEnv('POSTGRESQL_INITSCRIPTS_USERNAME', 'root')
    .withEnv('POSTGRESQL_INITSCRIPTS_PASSWORD', 'admin')
    .withEnv('POSTGRESQL_ENABLE_LDAP', 'no')
    .withEnv('POSTGRESQL_ENABLE_TLS', 'no')
    .withEnv('POSTGRESQL_LOG_HOSTNAME', 'false')
    .withEnv('POSTGRESQL_LOG_CONNECTIONS', 'false')
    .withEnv('POSTGRESQL_LOG_DISCONNECTIONS', 'false')
    .withEnv('POSTGRESQL_PGAUDIT_LOG_CATALOG', 'off')
    .withEnv('POSTGRESQL_CLIENT_MIN_MESSAGES', 'error')
    .withEnv('POSTGRESQL_SHARED_PRELOAD_LIBRARIES', 'pgaudit')
    .withDefaultLogDriver()
    .start();
}
