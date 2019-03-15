FROM node:10

WORKDIR /usr/src/app

# Set the front and mongodb IP
ENV FRONT=http://localhost:4200/
ENV MONGODB=mongodb://172.17.0.1:27017

# Update Packages and install common deps
RUN apt-get update
RUN apt-get upgrade -y

# Copy all files to the image
COPY . .

EXPOSE 8080

# Run backend when a container is created
CMD ["npm", "start"]

### To build an image use: docker build -t korp/etm-backend . ###
### To create a container use: docker run -e FRONT='link' -e MONGODB='link' --name etm-backend korp/etm-backend ###
