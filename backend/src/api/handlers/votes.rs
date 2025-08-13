use crate::api::errors::AppError;
use crate::api::router::RouterState;
use crate::db::handlers::votes::{downvote, upvote};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct VoteRequest {
    user_id: Uuid,
}

pub async fn upvote_handler(
    State(state): State<RouterState>,
    Path(note_id): Path<Uuid>,
    Json(payload): Json<VoteRequest>,
) -> Result<impl IntoResponse, AppError> {
    match upvote(&state.db_wrapper, payload.user_id, note_id).await {
        Ok(_) => Ok(StatusCode::OK),
        Err(e) => {
            tracing::error!("Failed to upvote note: {}", e);
            Err(AppError::Note(crate::api::errors::NoteError::DatabaseError(
                "Failed to upvote note".to_string(),
                e.into(),
            )))
        }
    }
}

pub async fn downvote_handler(
    State(state): State<RouterState>,
    Path(note_id): Path<Uuid>,
    Json(payload): Json<VoteRequest>,
) -> Result<impl IntoResponse, AppError> {
    match downvote(&state.db_wrapper, payload.user_id, note_id).await {
        Ok(_) => Ok(StatusCode::OK),
        Err(e) => {
            tracing::error!("Failed to downvote note: {}", e);
            Err(AppError::Note(crate::api::errors::NoteError::DatabaseError(
                "Failed to downvote note".to_string(),
                e.into(),
            )))
        }
    }
}