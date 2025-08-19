FROM node:24-alpine3.21 AS frontend-builder

WORKDIR /app/frontend

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
COPY backend/metaploy ./metaploy
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
COPY backend/metaploy ./

# Make postinstall script executable
RUN chmod +x ./postinstall.sh

# Copy frontend build from the previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/backend .
ENV FRONTEND_BUILD_DIR=/app/frontend/dist

CMD ["./postinstall.sh", "./backend"]
