#!/bin/sh

: ${CONFIG_FILE:=$1}
shift

if [[ $(id -u) -eq 0 ]]; then
  : ${EXIM_USER:=exim}
  : ${EXIM_GROUP:=exim}
fi

LOG="+all"

set -x
exec exim -C "${CONFIG_FILE:-$(realpath "$(dirname "$0")/exim.conf")}" \
  -DUID=$(id -u $EXIM_USER) \
  -DGID=$(id -g $EXIM_GROUP) \
  -DROUTER_SMARTHOST=${SMTP_SERVER} \
  -DSMTP_PORT=${SMTP_PORT:-25} \
  -DFQDN=${EXIM_FQDN:-$(hostname -f)} \
  -DSPOOL=${EXIM_SPOOL:-/var/spool/exim} \
  -bdf -q1h -d${LOG} "$@"

