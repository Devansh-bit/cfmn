mod api;
mod db;

use axum::{
    routing::get,
    Router,
};

use tracing_subscriber;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    let port = 3000;
    tracing_subscriber::fmt::init();
    let app = api::router::create_router();

    let listener =
        tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    tracing::info!("Server is starting on port {}", port);

    axum::serve(listener, app).await?;
    Ok(())
}