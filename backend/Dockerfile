FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other backend source files
COPY . .

# Expose the backend port
EXPOSE 8000

# Start the node server
CMD ["npm", "start"]
