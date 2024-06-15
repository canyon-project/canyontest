FROM node:lts

MAINTAINER wr_zhang25

RUN mkdir -p /app
COPY . /app/
WORKDIR /app

RUN npm install pnpm -g
RUN pnpm i
RUN pnpm run build

CMD ["node", "packages/canyontest-backend/dist/main.js" ]
