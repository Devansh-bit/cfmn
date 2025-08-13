use uuid::Uuid;
use crate::db::db::DBPoolWrapper;
use crate::db::models::Note;
use crate::api::models::CreateNote;

/// Inserts a new note record into the database.
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

/// Fetches all note records from the database.
pub async fn get_all_notes(db_wrapper: &DBPoolWrapper, num_notes: usize) -> Result<Vec<Note>, sqlx::Error> {
    let notes = sqlx::query_as!(
        Note,
        "SELECT * FROM notes ORDER BY created_at DESC LIMIT $1 ",
        num_notes as i64  // Convert usize to i64 for SQL compatibility
    )
        .fetch_all(db_wrapper.pool())
        .await?;
    Ok(notes)
}

/// Searches for notes where the title or description match the query.
pub async fn search_notes_by_query(
    db_wrapper: &DBPoolWrapper,
    query: &str,
) -> Result<Vec<Note>, sqlx::Error> {
    let search_term = format!("%{}%", query); // Wrap query for partial matching
    let notes = sqlx::query_as!(
        Note,
        r#"
        SELECT *
        FROM notes
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
) -> Result<Note, sqlx::Error> {
    let note = sqlx::query_as!(
        Note,
        "SELECT * FROM notes WHERE id = $1",
        note_id
    )
        .fetch_one(db_wrapper.pool())
        .await?;
    Ok(note)
}
