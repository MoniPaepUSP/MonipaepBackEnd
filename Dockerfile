FROM node:20.11

WORKDIR /app

COPY ./package.json .
# RUN npm cache clean --force
# RUN npm install
RUN yarn cache clean --all
RUN yarn install
COPY . .

EXPOSE 3333

# CMD npm start
CMD [ "yarn", "dev" ]
