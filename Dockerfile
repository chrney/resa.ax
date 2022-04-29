FROM node:16
EXPOSE 8080

## Change to your project repo https://username@github.com/username/repo_name.git
ENV GITURL "https://github.com/chrney/resa.ax"
WORKDIR /app

RUN git clone $GITURL
RUN npm install @quasar/cli -g
RUN npm install http-server -g
WORKDIR /app/resa.ax
RUN cat package.json
RUN git pull
RUN npm install
RUN quasar build
WORKDIR /app/resa.ax/dist/spa
CMD ["http-server", "."]
