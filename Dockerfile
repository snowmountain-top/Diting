# Build Stage
FROM node:18-bullseye-slim as install-dependencies
COPY package*.json /webapp/demo/
WORKDIR /webapp/demo
# node version not support
RUN npm install -g pnpm
RUN npm install -g npm@7.24.0
RUN pnpm uninstall sqlite3 -D
RUN npm set-script prepare '' && pnpm install --prod
RUN pnpm install pm2

# translate from TS to JS
FROM node:18-bullseye-slim as build
COPY --from=install-dependencies /webapp/demo /webapp/demo
COPY ./src /webapp/demo/src
COPY ./tsconfig.json ./pm2.json /webapp/demo/
WORKDIR /webapp/demo
RUN npm run build

# Copy all files & Package
FROM node:18-bullseye-slim
COPY --from=build /webapp/demo/node_modules /webapp/demo/node_modules
COPY --from=build /webapp/demo/package*.json /webapp/demo/pm2.json /webapp/demo/
# Copy project files
COPY --from=build /webapp/demo/dist /webapp/demo
COPY --from=build /webapp/demo/src/demo/resources /webapp/demo/resources
WORKDIR /webapp/demo
EXPOSE 8090
CMD npx pm2-runtime start pm2.json --output stdout
