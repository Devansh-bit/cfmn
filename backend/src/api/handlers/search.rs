
use axum::response::IntoResponse;
use axum::extract::{Form, Path, Query, State};
use axum::{http::StatusCode, response::Response, Json};
use chrono::NaiveDateTime;
use serde::Deserialize;
use crate::api::errors::AppError;

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

#[derive(Deserialize)]
pub struct SearchQuery {
    query: String,
}

pub async fn search_notes(Query(query): Query<SearchQuery>) -> Result<(StatusCode, Response), AppError> {
    if query.query.is_empty() {
        return Err(AppError::Search(SearchError::InvalidQuery("Query cannot be empty".to_owned())));
    }
    if query.query == "notfound".to_owned() {
        return Err(AppError::Search(SearchError::NotFound("Notes not found".to_owned())));
    }
    Ok((StatusCode::OK, Json(vec!["Note 1", "Note 2"]).into_response()))
}