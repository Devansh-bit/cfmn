mod api;
use axum::{
    routing::get,
    Router,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Read environment variables


    let app = api::router::create_router();
    let listener =
        tokio::net::TcpListener::bind(format!("0.0.0.0:{}", 3000)).await?;

    axum::serve(listener, app).await?;
    Ok(())
}