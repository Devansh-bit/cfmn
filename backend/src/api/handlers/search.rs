use crate::api::errors::{AppError, SearchError};
use axum::extract::Query;
use axum::response::IntoResponse;
use axum::{http::StatusCode, response::Response, Json};
use serde::Deserialize;


#[derive(Deserialize)]
pub struct SearchQuery {
    query: String,
}

pub async fn search_notes(Query(query): Query<SearchQuery>) -> Result<(StatusCode, Response), AppError> {
    if query.query.is_empty() {
        return Err(SearchError::InvalidQuery("Query cannot be empty".to_owned()).into());
    }
    if query.query == "notfound".to_owned() {
        return Err(AppError::Search(SearchError::NotFound("Notes not found".to_owned())));
    }
    Ok((StatusCode::OK, Json(vec!["Note 1", "Note 2"]).into_response()))
}