# Use a specific version of Node.js
FROM node:22.14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy only the package.json and yarn.lock to leverage Docker layer caching
COPY ./package.json ./yarn.lock ./

# Install dependencies inside the Docker container
RUN yarn cache clean --all
RUN yarn install

# Copy the rest of the application code (except for ignored files like node_modules)
COPY . .

# Expose the application port
EXPOSE 3333

# Start the app (using yarn dev for development)
CMD [ "yarn", "dev" ]
