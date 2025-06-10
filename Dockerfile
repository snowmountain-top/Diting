# Build Stage
FROM node:18-bullseye-slim AS install-dependencies
COPY package*.json /webapp/diting/
WORKDIR /webapp/diting/
RUN apt-get update && apt-get install -y git
RUN npm install -g pnpm npm@7.24.0
RUN npm set-script prepare '' && pnpm install --prod
RUN pnpm install pm2

# translate from TS to JS
FROM node:18-bullseye-slim AS build
COPY --from=install-dependencies /webapp/diting /webapp/diting/
COPY ./src /webapp/diting/src
COPY ./tsconfig.json ./pm2.json /webapp/diting/
WORKDIR /webapp/diting/
RUN npm run build

# Copy all files & Package
FROM node:18-bullseye-slim
COPY --from=build /webapp/diting/node_modules /webapp/diting/node_modules
COPY --from=build /webapp/diting/package*.json /webapp/diting/pm2.json /webapp/diting/
# Copy project files
COPY --from=build /webapp/diting/dist /webapp/diting/
# COPY --from=build /webapp/diting/src/diting/resources /webapp/diting/resources
WORKDIR /webapp/diting/
EXPOSE 8090
CMD npx pm2-runtime start pm2.json --output stdout
