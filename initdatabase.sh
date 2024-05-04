#!/bin/sh

# script que inicia container de teste de database com senha teste
sudo docker run -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgreslabesmonipaep -e POSTGRES_DB=monipaep -v /home/monipaep/IC-MoniPaEp-Backend/postgres_volume/:/var/lib/postgresql/data/ postgres:11
