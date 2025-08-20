FROM node:24-alpine3.21 AS frontend-builder

WORKDIR /app/frontend

# Pass the build arg and set as environment variable
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Echo the variable to verify it's set
RUN echo "VITE_GOOGLE_CLIENT_ID: $VITE_GOOGLE_CLIENT_ID"
RUN rm -rf ./dist

COPY frontend ./
RUN npm install
RUN npm run build


FROM rust:slim-bullseye AS builder

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apt-get update
RUN apt-get install -y build-essential musl-dev musl-tools pkgconf

# Copy dependency files
COPY backend/Cargo.toml backend/Cargo.lock ./

# Copy source code
COPY backend/src ./src
COPY metaploy ./metaploy
COPY backend/.sqlx ./.sqlx
COPY backend/migrations ./migrations

# For static build
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --target=x86_64-unknown-linux-musl --release

FROM alpine:latest AS app

# Install runtime dependencies correctly with apk
RUN apk add --no-cache \
  ca-certificates \
  tzdata \
  bash \
  poppler-utils \
  nginx

ENV TZ="Asia/Kolkata"

WORKDIR /app

# Copy metaploy files
COPY metaploy ./

# Make postinstall script executable
RUN chmod +x ./postinstall.sh

EXPOSE 8085

# Copy frontend build from the previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/backend .
ENV FRONTEND_BUILD_DIR=/app/frontend/dist

CMD ["./postinstall.sh", "./backend"]
