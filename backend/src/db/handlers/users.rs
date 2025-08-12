use crate::db::db::DBPoolWrapper;
use crate::db::DBError;
use crate::db::models::User;

const FAKE_PASSWORD_HASH: &str = "will_be_replaced_by_google_oauth";

/// Creates a new user in the database with a placeholder password.
/// This is a temporary setup until Google OAuth is implemented.
pub async fn create_user(db_wrapper: &DBPoolWrapper, username: String) -> Result<User, DBError> {
    let user = sqlx::query_as!(
        User,
        "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
        username,
        FAKE_PASSWORD_HASH
    )
        .fetch_one(db_wrapper.pool())
        .await?;
    Ok(user)
}