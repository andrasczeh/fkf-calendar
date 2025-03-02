FROM lukechannings/deno:1.6.3

RUN mkdir /crawler \
&& mkdir /config \
&& ln -s /config /crawler/config
COPY ./fkf /crawler/fkf
COPY ./ics /crawler/ics
COPY ./index.tsx /crawler/

WORKDIR /crawler

CMD [ "run", "--allow-net", "--allow-read", "--allow-write", "index.tsx" ]
