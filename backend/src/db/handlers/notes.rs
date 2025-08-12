// backend/src/db/handlers/notes.rs
use crate::db::db::DBPoolWrapper;
use crate::db::models::Note;
use serde::Deserialize;
use uuid::Uuid;
use crate::db::DBError;

#[derive(Deserialize)]
pub struct CreateNote {
    pub title: String,
    pub description: Option<String>,
    pub professor_names: Option<Vec<String>>,
    pub course_names: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub file_path: String,
    pub uploader_id: Uuid,
}

/// Inserts a new note record into the database.
pub async fn create_note(
    db_wrapper: &DBPoolWrapper,
    new_note: CreateNote,
) -> Result<Note, DBError> {
    let note = sqlx::query_as!(
        Note,
        r#"
        INSERT INTO notes (title, description, professor_names, course_names, tags, file_path, uploader_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, description, professor_names, course_names, tags, is_public, is_archived, file_path, uploader_id, created_at
        "#,
        new_note.title,
        new_note.description,
        new_note.professor_names.as_deref(),
        new_note.course_names.as_deref(),
        &new_note.tags.unwrap_or_default(),
        new_note.file_path,
        new_note.uploader_id
    )
        .fetch_one(db_wrapper.pool())
        .await?;
    Ok(note)
}

/// Fetches all note records from the database.
pub async fn get_all_notes(db_wrapper: &DBPoolWrapper) -> Result<Vec<Note>, DBError> {
    let notes = sqlx::query_as!(
        Note,
        "SELECT id, title, description, professor_names, course_names, tags, is_public, is_archived, file_path, uploader_id, created_at FROM notes"
    )
        .fetch_all(db_wrapper.pool())
        .await?;
    Ok(notes)
}
