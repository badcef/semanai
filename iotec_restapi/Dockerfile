# We use debian as our base distro for this container.
FROM debian:jessie

# Refresh apt-get.
RUN apt-get update

# Install some utilities needed by node, npm, and ZeroMQ.
RUN apt-get install -y curl make g++

#RUN apt-get install curl

# Install Node.js and npm.
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs

# Install required npm packages.
COPY src/ /src/
WORKDIR /src

RUN npm install
RUN npm install cors

# Open up external access to port 80.
EXPOSE  8081

# Run startup command.
CMD ["node", "/src/server.js"]
