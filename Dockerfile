# Use a base image
FROM node:18-alpine

# Add openssl
RUN apk add --no-cache openssl

# Set the working directory
WORKDIR /app

# Copy all code/config we need (see .dockerignore)
COPY . .

# Install dependencies
RUN npm ci --omit=dev

RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
