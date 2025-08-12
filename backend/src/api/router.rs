use super::handlers;
use crate::db::DBPoolWrapper;
use axum::routing::{get, post};
use axum::Router;

#[derive(Clone)]
pub(super) struct RouterState {
    pub db_wrapper: DBPoolWrapper,
}

pub fn create_router(db_wrapper: DBPoolWrapper) -> Router {
    let state = RouterState { db_wrapper };

    let api_router = Router::new()
        .route("/", get(handlers::misc::index))
        .route("/search", get(handlers::search::search_notes))
        // Add User routes
        .route("/users/register", post(handlers::users::register))
        // Add Note routes
        .route("/notes", get(handlers::notes::list_notes))
        .route("/notes/upload", post(handlers::notes::upload_note));

    Router::new()
        .nest("/api", api_router)
        .route("/", get(handlers::misc::serve_react_app))
        .with_state(state)
}
