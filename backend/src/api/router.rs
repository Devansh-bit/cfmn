use axum::Router;
use axum::routing::{get, post};

use super::handlers;

pub fn create_router() -> Router {
    let api_router = Router::new()
        .route("/", get(handlers::misc::index))
        .route("/search", get(handlers::search::search_notes));
        // .route("/notes/:filepath", get(handlers::assets))
        // .route("/", get(handlers::serve_react_app));

    Router::new().nest("/api", api_router)
        .route("/", get(handlers::misc::serve_react_app))

}
