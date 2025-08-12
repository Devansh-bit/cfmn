use axum::http::StatusCode;
use axum::Json;
use axum::response::{IntoResponse, Response};
use serde_json::json;

pub enum AppError {
    Note(NoteError),
    User(UserError),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::Note(err) => err.into_response(),
            AppError::User(err) => err.into_response(),
        }
    }
}

pub enum UserError {
    Conflict(String, sqlx::Error),
    Unknown(String, sqlx::Error),
    Reqwest(String, reqwest::Error),
}

impl From<UserError> for AppError {
    fn from(err: UserError) -> Self {
        AppError::User(err)
    }
}

impl IntoResponse for UserError {
    fn into_response(self) -> Response {
        match self {
            UserError::Conflict(msg, err) => {
                tracing::error!("User conflict error: {}", err);
                (StatusCode::CONFLICT, msg).into_response()
            }
            UserError::Unknown(msg, err) => {
                tracing::error!("Unknown user error: {}", err);
                (StatusCode::INTERNAL_SERVER_ERROR, msg).into_response()
            }
            UserError::Reqwest(msg, err) => {
                tracing::error!("Reqwest error: {}, {}", msg, err);
                (StatusCode::INTERNAL_SERVER_ERROR, msg).into_response()
            }
        }
    }
}

#[derive(Debug)]
pub enum NoteError {
    InvalidData(String),
    UploadFailed(String),
    DatabaseError(String, sqlx::Error),
}

impl From<NoteError> for AppError {
    fn from(err: NoteError) -> Self {
        AppError::Note(err)
    }
}

impl IntoResponse for NoteError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            NoteError::InvalidData(msg) => (StatusCode::BAD_REQUEST, msg),
            NoteError::UploadFailed(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            NoteError::DatabaseError(msg, err) => {
                tracing::error!("Database error: {:?}", err);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    msg,
                )
            }
        };

        (status, Json(json!({ "error": error_message }))).into_response()
    }
}
