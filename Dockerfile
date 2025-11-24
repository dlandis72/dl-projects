FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the port your app runs on (change if different)
EXPOSE 3000

# Start the application
CMD ["node", "user-input-app.js"]