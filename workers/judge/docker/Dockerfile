FROM gcc:13-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends time coreutils python3 openjdk-17-jdk-headless \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --create-home --uid 1000 --shell /usr/sbin/nologin runner

USER runner
WORKDIR /tmp
