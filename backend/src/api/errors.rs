use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use super::handlers::search::SearchError;


pub enum AppError {
    Search(SearchError),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::Search(err) => err.into_response(),
        }
    }
}

// pub struct AppError {
//     message: String,
//     code: u16,
// }
//
// impl IntoResponse for AppError {
//     fn into_response(self) -> Response {
//         tracing::error!("An error occurred: {}", self.message);
//         (
//             StatusCode::INTERNAL_SERVER_ERROR,
//             format!("Error {}: {}", self.code, "Something went terribly wrong. Please try again."),
//         )
//             .into_response()
//     }
// }
//
// pub struct SearchError {
//     message: String,
//     code: u16,
// }
