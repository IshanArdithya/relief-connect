FROM node:18-alpine AS base

# Enable Corepack for Yarn
RUN corepack enable && corepack prepare yarn@4.0.2 --activate

# Build stage
FROM base AS builder
WORKDIR /app

# Copy workspace files
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY libs/shared/package.json ./libs/shared/
COPY libs/shared/tsconfig.json ./libs/shared/
COPY libs/shared/project.json ./libs/shared/
COPY tsconfig.base.json ./

# Install dependencies (including dev dependencies for build)
WORKDIR /app/apps/api
RUN yarn workspaces focus
WORKDIR /app

# Copy source code
COPY apps/api/src ./apps/api/src
COPY libs/shared/src ./libs/shared/src

# Build shared library first
RUN echo "Building shared library..." && \
    yarn workspace @nx-mono-repo-deployment-test/shared build && \
    echo "Shared library built successfully"

# Build API
WORKDIR /app/apps/api
RUN echo "Building API..." && \
    yarn build && \
    echo "API built successfully" && \
    ls -la dist/

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built files and production dependencies
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
# Copy shared library source files (for reference, but we'll use compiled version)
COPY --from=builder /app/libs/shared/package.json ./libs/shared/package.json
COPY --from=builder /app/libs/shared/src ./libs/shared/src
# Copy shared library to node_modules so Node.js can resolve @nx-mono-repo-deployment-test/shared
# The compiled code imports from /src/ paths, so we need to maintain that structure
# Copy compiled JavaScript files from dist/libs/shared to maintain src/ structure
RUN rm -rf node_modules/@nx-mono-repo-deployment-test/shared && \
    mkdir -p node_modules/@nx-mono-repo-deployment-test/shared
COPY --from=builder /app/libs/shared/package.json node_modules/@nx-mono-repo-deployment-test/shared/package.json
# Copy compiled JavaScript files but maintain src/ directory structure for imports
# The imports use @nx-mono-repo-deployment-test/shared/src/enums, so we need src/ with .js files
# Shared library builds to dist/libs/shared/src (preserving src/ structure)
COPY --from=builder /app/dist/libs/shared/src node_modules/@nx-mono-repo-deployment-test/shared/src
# Copy apps/api directory structure for .env file resolution
# The .env.dev file will be mounted by docker-compose, but we need the directory structure
COPY --from=builder /app/apps/api ./apps/api

# Set environment (PORT will be overridden by .env.dev file)
ENV NODE_ENV=production
ENV PORT=3010

USER nodejs

EXPOSE 3010

# Note: Check actual path in dist folder
# If nested: dist/apps/api/src/main.js or just dist/main.js
CMD ["node", "dist/apps/api/src/main.js"]
