use chrono::{DateTime, Utc};
use clap::builder::Str;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct User {
    pub id: Uuid,
    pub google_id: String,
    pub email: String,
    pub full_name: String,
    pub reputation: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Note {
    pub id: Uuid,
    pub course_name: String,
    pub course_code: String,
    pub description: Option<String>,
    pub professor_names: Option<Vec<String>>,
    pub tags: Vec<String>,
    pub is_public: bool,
    pub has_preview_image: bool,
    pub uploader_user_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Vote {
    pub id: Uuid,
    pub user_id: Uuid,
    pub note_id: Uuid,
    pub vote_type: String,
    pub created_at: DateTime<Utc>,
}