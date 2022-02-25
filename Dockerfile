FROM nodered/node-red:latest

ARG MISSION_CONTROL=false

RUN npm install node-red-contrib-chatbot@beta --unsafe-perm --no-update-notifier --no-fund --only=production
