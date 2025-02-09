# BUILD STAGE
FROM node:20.18-bookworm as BUILD

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn cache clean --all
RUN yarn install --frozen-lockfile

COPY . .
RUN npm run build

# RUN STAGE
FROM node:20.18-alpine as RUN

COPY --from=BUILD ./dist ./
COPY --from=BUILD ./package.json ./

EXPOSE 3333

CMD [ "yarn", "start:prod" ]
