use crate::api::router::RouterState;
// backend/src/api/handlers/users.rs
use axum::{extract::State, http::StatusCode, Json};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct RegisterUser {
    username: String,
    password: String,
}

pub async fn register(
    State(db_pool): State<RouterState>,
    Json(payload): Json<RegisterUser>,
) -> Result<StatusCode, (StatusCode, String)> {
    // TODO: Hash password
    let password_hash = payload.password; // Placeholder

    // let result = sqlx::query!(
    //     "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
    //     payload.username,
    //     password_hash
    // )
    //     .execute(&db_pool)
    //     .await;
    todo!()
    // match result {
    //     Ok(_) => Ok(StatusCode::CREATED),
    //     Err(err) => {
    //         tracing::error!("Failed to register user: {}", err);
    //         Err((StatusCode::INTERNAL_SERVER_ERROR, "Failed to register user".to_string()))
    //     }
    // }
}
