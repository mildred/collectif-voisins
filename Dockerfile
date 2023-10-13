# https://stackoverflow.com/questions/44316292/ssl-sslerror-tlsv1-alert-protocol-version
FROM docker.io/nimlang/nim:2.0.0-regular AS disputatio

# RUN apk add --no-cache jansson-dev icu-dev util-linux-dev
RUN export DEBIAN_FRONTEND=noninteractive; \
    apt-get update && \
    apt-get install -y libjansson-dev libicu-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN : commit a4bb756 && \
    git clone https://github.com/mildred/disputatio.nim . && \
    nimble install -y -d && \
    nimble c -y -d:version="$(git describe --always)" src/disputatio



FROM alpine AS hugo
ENV HUGO_VERSION=0.118.2
WORKDIR /bin
RUN wget https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz
RUN tar zxvf hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz hugo

FROM node AS front
WORKDIR /app
ADD . /app
RUN npm install
COPY --from=hugo /bin/hugo /bin/hugo
RUN ./build-app.sh



FROM alpine

RUN apk add --no-cache supervisor exim jansson icu libuuid ca-certificates fuse3 sqlite gcompat

# https://stackoverflow.com/questions/44316292/ssl-sslerror-tlsv1-alert-protocol-version
# RUN sed -i 's/MinProtocol = TLSv1.2/MinProtocol = TLSv1/' /etc/ssl/openssl.cnf && \
#     sed -i 's/CipherString = DEFAULT@SECLEVEL=2/CipherString = DEFAULT@SECLEVEL=1/' /etc/ssl/openssl.cnf

RUN mkdir -p /var/lib/disputatio

COPY --from=umputun/reproxy /srv/reproxy /bin/reproxy
COPY --from=flyio/litefs:0.5 /usr/local/bin/litefs /usr/local/bin/litefs
COPY --from=disputatio /app/src/disputatio /bin/disputatio
COPY --from=front /app/public /usr/share/assets

ADD litefs.yml /etc/
ADD supervisord.conf /etc/
ADD exim.conf /etc/
ADD reproxy.yml /etc/
ADD run-exim.sh /bin/
add start.sh /bin

ENV DISPUTATIO_SECRETKEY=

CMD /bin/start.sh
# CMD supervisord -c /etc/supervisord.conf

