use crate::db::db::DBPoolWrapper;
use crate::db::models::User;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct GoogleUserInfo {
    pub google_id: String,
    pub email: String,
    pub full_name: String,
}

/// Finds a user by their Google ID. If the user doesn't exist, it creates a new one.
pub async fn find_or_create_user(
    db_wrapper: &DBPoolWrapper,
    user_info: GoogleUserInfo,
) -> Result<User, sqlx::Error> {
    // First, try to find the user by their Google ID.
    let existing_user = sqlx::query_as!(
        User,
        "SELECT id, google_id, email, full_name, reputation, created_at FROM users WHERE google_id = $1",
        user_info.google_id
    )
        .fetch_optional(db_wrapper.pool())
        .await?;

    // If the user exists, return it.
    if let Some(user) = existing_user {
        return Ok(user);
    }

    // If the user does not exist, create a new record.
    let new_user = sqlx::query_as!(
        User,
        "INSERT INTO users (google_id, email, full_name) VALUES ($1, $2, $3) RETURNING id, google_id, email, full_name, reputation, created_at",
        user_info.google_id,
        user_info.email,
        user_info.full_name
    )
        .fetch_one(db_wrapper.pool())
        .await?;

    Ok(new_user)
}
