#!/bin/sh

mkdir -p /srv/litefs

if [ -n "$FLY_APP_NAME" ]; then
  exec litefs mount
else
  exec supervisord -c /etc/supervisord.conf
fi
