// backend/src/main.rs
mod api;
mod db;
mod env;
mod pathutils;

use tower_http::cors::{AllowHeaders, AllowOrigin, Any, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;
use std::net::SocketAddr;
use axum::extract::DefaultBodyLimit;
use axum::http::{HeaderName, HeaderValue, Method};
use clap::Parser;
use dotenvy::dotenv;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let env_vars = env::EnvVars::parse().process()?;
    tracing_subscriber::fmt::init();
    let db_wrapper = db::DBPoolWrapper::new().await;
    tracing::info!("Database connection established.");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::HEAD,
            Method::OPTIONS,
        ])
        .allow_headers([
            HeaderName::from_static("content-type"),
            HeaderName::from_static("authorization"),
            HeaderName::from_static("accept"),
            HeaderName::from_static("origin"),
            HeaderName::from_static("x-requested-with"),
        ]);

    let file_size_limit = env_vars.file_size_limit;
    let app = api::router::create_router(db_wrapper, env_vars)
        .layer(DefaultBodyLimit::max(file_size_limit * 1024 * 1024))
        .layer(RequestBodyLimitLayer::new( file_size_limit * 1024 * 1024))
        .layer(cors);


    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}