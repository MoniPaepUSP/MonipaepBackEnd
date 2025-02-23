# BUILD STAGE
FROM node:20.18-bookworm AS build

RUN useradd -ms /bin/sh -u 1001 app
USER app

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn cache clean --all
RUN yarn install --frozen-lockfile

COPY --chown=app:app . /app
RUN yarn run build

# RUN STAGE
FROM node:20.18-alpine AS run

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json .

EXPOSE 443
EXPOSE 81

CMD [ "yarn", "start:prod" ]
