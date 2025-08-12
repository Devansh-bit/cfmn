use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use crate::db::DBError;

pub enum AppError {
    Search(SearchError),
    DB(DBError),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::Search(err) => err.into_response(),
            AppError::DB(err) => err.into_response(),
        }
    }
}

impl From<SearchError> for AppError {
    fn from(err: SearchError) -> Self {
        AppError::Search(err)
    }
}

impl From<DBError> for AppError {
    fn from(err: DBError) -> Self {
        AppError::DB(err)
    }
}



pub enum SearchError {
    NotFound(String),
    InvalidQuery(String),
}

impl IntoResponse for SearchError {
    fn into_response(self) -> Response {
        match self {
            SearchError::NotFound(msg) => {tracing::error!(msg); (StatusCode::NOT_FOUND, msg).into_response()},
            SearchError::InvalidQuery(msg) => {tracing::error!(msg); (StatusCode::BAD_REQUEST, msg).into_response()},
        }
    }
}
