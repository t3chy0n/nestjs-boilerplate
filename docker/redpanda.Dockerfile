FROM vectorized/redpanda:latest as redpanda
RUN rpk config set redpanda.auto_create_topics_enabled true