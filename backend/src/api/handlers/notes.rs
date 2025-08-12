use crate::api::errors::{AppError, NoteError};
use crate::api::router::RouterState;
use crate::db::handlers::notes::{create_note, get_all_notes, search_notes_by_query, CreateNote};
use axum::extract::{multipart::Multipart, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use std::path::Path;
use serde::Deserialize;
use tokio::fs;
use uuid::Uuid;
use crate::api::errors::AppError::NoteErr;

/// API handler to list all notes.
pub async fn list_notes(
    State(state): State<RouterState>,
) -> Result<(StatusCode, Response), AppError> {
    match get_all_notes(&state.db_wrapper).await {
        Ok(notes) => Ok((StatusCode::OK, Json(notes).into_response())),
        Err(err) => Err(NoteError::Unknown("Failed to fetch notes".to_string(), err).into()),
    }
}


#[derive(Deserialize)]
pub struct SearchQuery {
    query: String,
}

pub async fn search_notes(
    State(state): State<RouterState>,
    Query(query): Query<SearchQuery>,
) -> Result<(StatusCode, Response), AppError> {
    if query.query.is_empty() {
        return Err(
            NoteError::InvalidQuery("Query cannot be empty".to_string()).into(),
        );
    }

    match search_notes_by_query(&state.db_wrapper, &query.query).await {
        Ok(notes) => Ok((StatusCode::OK, Json(notes).into_response())),
        Err(err) => {
            Err(NoteError::Unknown("Failed to fetch notes".to_string(), err).into())
        }
    }
}

/// API handler for uploading a new note.
/// Expects a multipart form with fields: 'title', 'description', 'uploader_id', and 'file'.
/// Array fields like 'tags' should be comma-separated strings.
pub async fn upload_note(
    State(state): State<RouterState>,
    mut multipart: Multipart,
) -> Result<(StatusCode, Response), AppError> {
    let mut title = String::new();
    let mut description: Option<String> = None;
    let mut uploader_id_str = String::new();
    let mut professor_names: Option<Vec<String>> = None;
    let mut course_names: Option<Vec<String>> = None;
    let mut tags: Option<Vec<String>> = None;
    let mut file_path: Option<String> = None;

    let upload_dir = Path::new("uploads");
    if !upload_dir.exists() {
        fs::create_dir_all(upload_dir)
            .await
            .map_err(|e| NoteError::DirectoryError("Failed to create upload dir".to_string(), e))?;
    }

    while let Ok(Some(field)) = multipart.next_field().await {
        let name = match field.name() {
            Some(name) => name.to_string(),
            None => continue,
        };

        if name == "file" {
            let original_filename = field.file_name().unwrap_or("unknown_file").to_string();
            let extension = Path::new(&original_filename)
                .extension()
                .and_then(std::ffi::OsStr::to_str)
                .unwrap_or("");

            let new_filename = format!("{}.{}", Uuid::new_v4(), extension);
            let path = upload_dir.join(&new_filename);

            let data = field
                .bytes()
                .await
                .map_err(|_| NoteError::FileError("Failed to read file bytes".to_string()))?;

            if fs::write(&path, &data).await.is_ok() {
                file_path = Some(path.to_str().unwrap().to_string());
            } else {
                Err(NoteError::FileError("Failed to save file".to_string()))?;
            }
            continue; // Move to the next field
        }

        // For all other text-based fields
        let data = field.text().await.map_err(|_| {
            NoteError::FileError(format!("Invalid format for field: {}", name))
        })?;

        match name.as_str() {
            "title" => title = data,
            "description" => description = Some(data),
            "uploader_id" => uploader_id_str = data,
            // For array fields, we expect a comma-separated string
            "professor_names" => {
                professor_names = Some(data.split(',').map(|s| s.trim().to_string()).collect())
            }
            "course_names" => {
                course_names = Some(data.split(',').map(|s| s.trim().to_string()).collect())
            }
            "tags" => tags = Some(data.split(',').map(|s| s.trim().to_string()).collect()),
            _ => (),
        }
    }

    if title.is_empty() {
        return Err(NoteError::InvalidQuery("Title is required".to_string()))?;
    }

    let uploader_id = Uuid::parse_str(&uploader_id_str).map_err(|_| {
        NoteError::InvalidQuery("Invalid or missing uploader_id".to_string())
    })?;

    let final_file_path =
        file_path.ok_or(NoteError::InvalidQuery("File not provided".to_string()))?;

    let new_note = CreateNote {
        title,
        description,
        professor_names,
        course_names,
        tags,
        file_path: final_file_path,
        uploader_id,
    };

    match create_note(&state.db_wrapper, new_note).await {
        Ok(note) => Ok((StatusCode::OK, Json(note).into_response())),
        Err(err) => {
            Err(NoteError::Unknown("Failed to create note".to_string(), err).into())
        }
    }
}
