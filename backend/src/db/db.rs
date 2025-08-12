use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use std::env;

#[derive(Clone)]
pub struct DBPoolWrapper {
    pool: Pool<Postgres>,
}

impl DBPoolWrapper {
    pub async fn new() -> Self {
        let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let connection_pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .expect("Error connecting to database");
        sqlx::migrate!("../migrations")
            .run(&connection_pool)
            .await
            .expect("Error running migrations");
        Self {
            pool: connection_pool,
        }
    }

    pub fn pool(&self) -> &Pool<Postgres> {
        &self.pool
    }
}
