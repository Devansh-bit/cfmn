use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

pub enum AppError {
    NoteErr(NoteError),
    UserErr(UserError),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::NoteErr(err) => err.into_response(),
            AppError::UserErr(err) => err.into_response(),
        }
    }
}

pub enum UserError {
    Conflict(String, sqlx::Error),
    Unknown(String, sqlx::Error),
}

impl From<UserError> for AppError {
    fn from(err: UserError) -> Self {
        AppError::UserErr(err)
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
        }
    }
}

pub enum NoteError {
    NotFound(String, sqlx::Error),
    InvalidQuery(String),
    DirectoryError(String, std::io::Error),
    Unknown(String, sqlx::Error),
    FileError(String),
}

impl From<NoteError> for AppError {
    fn from(err: NoteError) -> Self {
        AppError::NoteErr(err)
    }
}

impl IntoResponse for NoteError {
    fn into_response(self) -> Response {
        match self {
            NoteError::NotFound(msg, err) => {
                tracing::error!("Not Found {}", err);
                (StatusCode::NOT_FOUND, msg).into_response()
            }
            NoteError::InvalidQuery(msg) => {
                tracing::error!("Invalid Query {}", msg);
                (StatusCode::BAD_REQUEST, msg).into_response()
            }
            NoteError::Unknown(msg, err) => {
                tracing::error!("Unknown search error: {}", err);
                (StatusCode::INTERNAL_SERVER_ERROR, msg).into_response()
            }
            NoteError::DirectoryError(msg, err) => {
                tracing::error!("Directory error: {}", err);
                (StatusCode::INTERNAL_SERVER_ERROR, msg).into_response()
            }
            NoteError::FileError(msg) => {
                tracing::error!("File error: {}", msg);
                (StatusCode::INTERNAL_SERVER_ERROR, msg).into_response()
            }
        }
    }
}
