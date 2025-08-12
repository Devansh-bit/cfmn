use axum::response::IntoResponse;
use sqlx::Error;
use tracing::error;

pub enum DBError {
    ConnectionError(String, Error),
    QueryError(String, Error),
    NotFound(String, Error),
}

impl From<Error> for DBError {
    fn from(err: Error) -> Self {
        match err {
            Error::Io(_) | Error::Tls(_) => DBError::ConnectionError("Database connection error".to_string(), err),
            Error::RowNotFound => DBError::NotFound("Resource not found".to_string(), err),
            Error::Database(_) => DBError::QueryError("Database query error".to_string(), err),
            _ => DBError::QueryError("An unknown database error occurred".to_string(), err),
        }
    }
}

impl IntoResponse for DBError {
    fn into_response(self) -> axum::response::Response {
        match self {
            DBError::ConnectionError(msg, e) => {
                error!("Failed to connect to the database (debug): {:?}", e);
                (axum::http::StatusCode::INTERNAL_SERVER_ERROR, msg).into_response()
            }
            DBError::QueryError(msg, e) => {
                error!("Query execution failed (debug): {:?}", e);
                (axum::http::StatusCode::BAD_REQUEST, msg).into_response()
            }
            DBError::NotFound(msg, e) => {
                error!("Resource not found (debug): {:?}", e);
                (axum::http::StatusCode::NOT_FOUND, msg).into_response()
            }
        }
    }

}