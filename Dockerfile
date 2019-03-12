FROM node

WORKDIR /usr/src/app

ENV FRONT=http://localhost:4200/
ENV MONGODB=mongodb://172.17.0.1:27017

# Update Packages and install common deps
RUN apt-get update
RUN apt-get upgrade -y

# Install node, NPM and GIT
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

# Copy all files to the image
COPY . .

# Run backend when a container is created
CMD ["npm", "start"]
