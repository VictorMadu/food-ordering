FROM node:18-alpine As build
WORKDIR /usr/app/

RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml

RUN pnpm install


COPY ./src ./src
COPY ./nest-cli.json ./nest-cli.json
COPY ./tsconfig* ./
COPY ./jest* ./

RUN pnpm build


FROM node:18-alpine As production
COPY --from=build /usr/app/node_modules ./node_modules
COPY --from=build /usr/app/dist ./dist

CMD node ./dist/main.js