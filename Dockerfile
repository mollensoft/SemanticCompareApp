
# base Node.js LTS image
FROM node:buster-slim

WORKDIR /usr/src/app
COPY --chown=node:node . /usr/src/app
COPY package*.json ./
COPY . .
ENV NODE_ENV=production

RUN apt-get update && \ 
    apt-get install -y build-essential \
    wget \
    python3 \
    make \
    gcc \ 
    libc6-dev 

RUN npm install wink-nlp --save --legacy-peer-deps 
RUN npm install wink-eng-lite-web-model --save --legacy-peer-deps 
RUN node -e "require( 'wink-nlp/models/install' )" wink-eng-lite-model --legacy-peer-deps 
RUN npm install node-summarizer
RUN npm install express --legacy-peer-deps
RUN npm install formidable --legacy-peer-deps
RUN npm install cors --legacy-peer-deps
RUN npm install helmet --legacy-peer-deps
RUN npm install @tensorflow/tfjs-node
RUN npm install @tensorflow-models/universal-sentence-encoder --legacy-peer-deps 
RUN npm install @tensorflow/tfjs-core --legacy-peer-deps
RUN npm install @tensorflow/tfjs-converter --legacy-peer-deps

ENV NODE_PORT=8080
EXPOSE $NODE_PORT

USER node

# application launch command
CMD [ "node", "server.js" ]