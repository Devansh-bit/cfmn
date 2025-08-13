use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateNote {
    pub course_name: String,
    pub course_code: String,
    pub description: Option<String>,
    pub professor_names: Option<Vec<String>>,
    pub tags: Vec<String>,
    pub has_preview_image: bool,
    pub uploader_user_id: Uuid,
    pub timestamp: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]

pub struct ResponseUser {
    pub id: Uuid,
    pub google_id: String,
    pub email: String,
    pub full_name: String,
    pub reputation: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResponseNote {
    pub id: Uuid,
    pub course_name: String,
    pub course_code: String,
    pub description: Option<String>,
    pub professor_names: Option<Vec<String>>,
    pub tags: Vec<String>,
    pub is_public: bool,
    pub preview_image_url: Option<String>,
    pub file_url: String,
    pub uploader_user: ResponseUser,
    pub created_at: DateTime<Utc>,
}