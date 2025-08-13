use super::handlers;
use crate::api::auth;
use crate::db::DBPoolWrapper;
use crate::env::EnvVars;
use axum::middleware::from_fn_with_state;
use axum::{routing::{get, post}, Router};

#[derive(Clone)]
pub(super) struct RouterState {
    pub db_wrapper: DBPoolWrapper,
    pub env_vars: EnvVars
}

pub fn create_router(db_wrapper: DBPoolWrapper, env_vars: EnvVars) -> Router {
    let state = RouterState {
        db_wrapper,
        env_vars,
    };

    let protected_router = Router::new()
        .route("/notes/upload", post(handlers::notes::upload_note))
        .route(
            "/notes/{note_id}/upvote",
            post(handlers::votes::upvote_handler),
        )
        .route(
            "/notes/{note_id}/downvote",
            post(handlers::votes::downvote_handler),
        )
        .route_layer(from_fn_with_state(
            state.clone(),
            auth::verify_token_middleware,
        ));

    let public_router = Router::new()
        .route("/", get(handlers::misc::index))
        .route("/notes", get(handlers::notes::list_notes))
        .route("/notes/search", get(handlers::notes::search_notes))
        //.route("/notes/{note_id}", get(handlers::notes::download_note))
        .route("/auth/google", post(handlers::auth::google_auth_callback))
    ;

    let api_router = Router::new().merge(public_router).merge(protected_router);

    Router::new()
        .nest("/api", api_router)
        .route("/", get(handlers::misc::serve_react_app))
        .with_state(state)
}
