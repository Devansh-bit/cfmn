use crate::api::errors::AppError;
use crate::api::errors::UserError;
use crate::api::router::RouterState;
use crate::db::handlers::users::{create_user, CreateUser};
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;

/// API handler to register a new user.
/// It takes a username and creates a user with a placeholder password.
pub async fn register(
    State(state): State<RouterState>,
    Json(payload): Json<CreateUser>,
) -> Result<(StatusCode, Response), AppError> {
    match create_user(&state.db_wrapper, payload).await {
        Ok(user) => Ok((StatusCode::OK, Json(user).into_response())),
        Err(err) => {
            if err.as_database_error().is_some()
                && err.as_database_error().unwrap().is_unique_violation()
            {
                return Err(UserError::Conflict("Username already exists".to_string(), err).into());
            }
            Err(UserError::Unknown("Failed to register user".to_string(), err).into())
        }
    }
}
