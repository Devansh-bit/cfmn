use serde::{Deserialize, Serialize};
use sqlx::Postgres;
use uuid::Uuid;
use crate::db::db::DBPoolWrapper;
use crate::db::models::{Note, NoteWithUser, User};

use crate::api::models::CreateNote;

/// Inserts a new note record into the database.

pub async fn update_note_preview_status(
    tx: &mut sqlx::Transaction<'_, Postgres>,
    note_id: Uuid,
    status: bool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE notes SET has_preview_image = $1 WHERE id = $2",
        status,
        note_id
    )
        .execute(&mut **tx)
        .await?;

    Ok(())
}

pub async fn create_note(
    db_wrapper: &DBPoolWrapper,
    new_note: CreateNote,
) -> Result<(sqlx::Transaction<'_, sqlx::Postgres>, Note), sqlx::Error> {
    // Begin a transaction
    let mut tx = db_wrapper.pool().begin().await?;

    let note = sqlx::query_as!(
        Note,
        r#"
        INSERT INTO notes (course_name, course_code, description, professor_names, tags, has_preview_image, uploader_user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, course_name, course_code, description, professor_names, tags, is_public, has_preview_image, uploader_user_id, created_at
        "#,
        new_note.course_name,
        new_note.course_code,
        new_note.description,
        new_note.professor_names.as_deref(),
        &new_note.tags,
        new_note.has_preview_image,
        new_note.uploader_user_id
    )
        .fetch_one(&mut *tx)  // Execute on the transaction instead of the pool
        .await?;

    Ok((tx, note))
}

pub async fn get_notes(db_wrapper: &DBPoolWrapper, num_notes: usize) -> Result<Vec<NoteWithUser>, sqlx::Error> {
    let notes = sqlx::query_as!(
        NoteWithUser,
        r#"
        SELECT
            n.id as "note_id!",
            n.course_name as "note_course_name!",
            n.course_code as "note_course_code!",
            n.description as "note_description",
            n.professor_names as "note_professor_names",
            n.tags as "note_tags!",
            n.is_public as "note_is_public!",
            n.has_preview_image as "note_has_preview_image!",
            n.uploader_user_id as "note_uploader_user_id!",
            n.created_at as "note_created_at!",
            u.id as "user_id!",
            u.google_id as "user_google_id!",
            u.email as "user_email!",
            u.full_name as "user_full_name!",
            u.reputation as "user_reputation!",
            u.created_at as "user_created_at!"
        FROM
            notes n
        JOIN
            users u ON n.uploader_user_id = u.id
        ORDER BY
            n.created_at DESC
        LIMIT $1
        "#,
        num_notes as i64
    )
        .fetch_all(db_wrapper.pool())
        .await?;
    Ok(notes)
}

/// Searches for notes where the title or description match the query.
pub async fn search_notes_by_query(
    db_wrapper: &DBPoolWrapper,
    query: &str,
) -> Result<Vec<NoteWithUser>, sqlx::Error> {
    let search_term = format!("%{}%", query); // Wrap query for partial matching
    let notes = sqlx::query_as!(
        NoteWithUser,
        r#"
        SELECT
            n.id as "note_id!",
            n.course_name as "note_course_name!",
            n.course_code as "note_course_code!",
            n.description as "note_description",
            n.professor_names as "note_professor_names",
            n.tags as "note_tags!",
            n.is_public as "note_is_public!",
            n.has_preview_image as "note_has_preview_image!",
            n.uploader_user_id as "note_uploader_user_id!",
            n.created_at as "note_created_at!",
            u.id as "user_id!",
            u.google_id as "user_google_id!",
            u.email as "user_email!",
            u.full_name as "user_full_name!",
            u.reputation as "user_reputation!",
            u.created_at as "user_created_at!"
        FROM
            notes n
        JOIN
            users u ON n.uploader_user_id = u.id
        WHERE course_name ILIKE $1 OR course_code ILIKE $1
        "#,
        search_term
    )
        .fetch_all(db_wrapper.pool())
        .await?;
    Ok(notes)
}

pub async fn get_note_by_id(
    db_wrapper: &DBPoolWrapper,
    note_id: Uuid,
) -> Result<NoteWithUser, sqlx::Error> {
    let note_with_user = sqlx::query_as!(
        NoteWithUser,
        r#"
        SELECT
            n.id as "note_id!",
            n.course_name as "note_course_name!",
            n.course_code as "note_course_code!",
            n.description as "note_description",
            n.professor_names as "note_professor_names",
            n.tags as "note_tags!",
            n.is_public as "note_is_public!",
            n.has_preview_image as "note_has_preview_image!",
            n.uploader_user_id as "note_uploader_user_id!",
            n.created_at as "note_created_at!",
            u.id as "user_id!",
            u.google_id as "user_google_id!",
            u.email as "user_email!",
            u.full_name as "user_full_name!",
            u.reputation as "user_reputation!",
            u.created_at as "user_created_at!"
        FROM
            notes n
        JOIN
            users u ON n.uploader_user_id = u.id
        WHERE n.id = $1
        "#,
        note_id
    )
        .fetch_one(db_wrapper.pool())
        .await?;
    Ok(note_with_user)
}
