// backend/src/main.rs
mod api;
mod db;
mod env;

use tower_http::cors::{Any, CorsLayer};
use std::net::SocketAddr;
use clap::Parser;
use dotenvy::dotenv;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let env_vars = env::EnvVars::parse();
    tracing_subscriber::fmt::init();
    let db_wrapper = db::DBPoolWrapper::new().await;
    tracing::info!("Database connection established.");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = api::router::create_router(db_wrapper, env_vars).layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}
