FROM nodered/node-red:2.1.4

RUN npm install node-red-contrib-chatbot@0.20.0-beta.7 --unsafe-perm --no-update-notifier --no-fund --only=production

ENV NODE_RED_ENABLE_TOURS=false
