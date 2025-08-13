use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
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