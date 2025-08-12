use serde::Deserialize;
use crate::db::models::User;
use crate::db::DBPoolWrapper;
use crate::db::errors::DBError;




pub async fn register_user(
    user: User,
    pool: DBPoolWrapper,
) -> Result<User, DBError> {
    let result = sqlx::query_as!(User,
        "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
        user.username,
        user.password_hash
    ).fetch_one(pool.pool()).await;
    match result {
        Ok(user) => Ok(user),
        Err(err) => {
            tracing::error!("Failed to register user: {}", err);
            Err(DBError::from(err))
        }
    }
}