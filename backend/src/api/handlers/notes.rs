use crate::api::errors::{AppError, NoteError};
use crate::api::router::RouterState;
use crate::db::handlers::notes::{create_note, get_notes, search_notes_by_query, get_note_by_id};
use axum::extract::{multipart::Multipart, Path, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use serde::Deserialize;
use axum::body::Bytes;
use chrono::Utc;
use tokio::fs;
use uuid::Uuid;
use crate::api::models::{CreateNote, ResponseNote, ResponseUser};
use crate::db::models::User;


#[derive(Deserialize)]
pub struct NoteQuery {
    pub num: Option<usize>,
}

/// API handler to list all notes.
pub async fn list_notes(
    State(state): State<RouterState>,
    Query(query): Query<NoteQuery>,
) -> Result<(StatusCode, Response), AppError> {
    match get_notes(&state.db_wrapper, query.num.unwrap_or(10)).await {
        Ok(notes) => {
            let response_notes: Vec<ResponseNote> = notes.into_iter()
                .map(|note| {
                    let file_url = state.env_vars.paths.get_note_url(&format!("{}.pdf", note.note_id)).unwrap();
                    ResponseNote::from_note_with_user(note, file_url)
                })
                .collect();
            Ok((StatusCode::OK, Json(response_notes).into_response()))
        },
        Err(err) => Err(NoteError::DatabaseError("Failed to fetch notes".to_string(), err.into()).into()),
    }
}

pub async fn note_by_id(
    State(state): State<RouterState>,
    Path(note_id): Path<Uuid>,
) -> Result<(StatusCode, Response), AppError> {
    tracing::debug!("Fetching note with ID: {}", note_id);
    match get_note_by_id(&state.db_wrapper, note_id).await {
        Ok(note) => {
            let file_url = state.env_vars.paths.get_note_url(&format!("{}.pdf", note.note_id)).unwrap();
            let response_note = ResponseNote::from_note_with_user(note, file_url);
            Ok((StatusCode::OK, Json(response_note).into_response()))
        },
        Err(err) => {
            tracing::error!("Failed to fetch note: {:?}", err);
            Err(NoteError::DatabaseError("Failed to fetch note".to_string(), err.into()).into())
        }
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
    tracing::debug!("Search query: {:?}", query.query);
    if query.query.is_empty() {
        return Err(
            NoteError::InvalidData("Query cannot be empty".to_string()).into(),
        );
    }
    match search_notes_by_query(&state.db_wrapper, &query.query).await {
        Ok(notes) => {
            let response_notes: Vec<ResponseNote> = notes.into_iter()
                .map(|note| {
                    let file_url = state.env_vars.paths.get_note_url(&format!("{}.pdf", note.note_id)).unwrap();
                    ResponseNote::from_note_with_user(note, file_url)
                })
                .collect();
            Ok((StatusCode::OK, Json(response_notes).into_response()))
        },
        Err(err) => {
            Err(NoteError::DatabaseError("Failed to fetch notes".to_string(), err.into()).into())
        }
    }
}

pub async fn upload_note(
    State(state): State<RouterState>,
    Extension(user): Extension<User>,
    mut multipart: Multipart,
) -> Result<(StatusCode, Response), AppError> {
    let mut course_name = String::new();
    let mut course_code = String::new();
    let mut description: Option<String> = None;
    let mut professor_names: Option<Vec<String>> = None;
    let mut tags: Vec<String> = Vec::new();
    let mut file_data: Option<Bytes> = None;
    let FILE_SIZE_LIMIT = state.env_vars.file_size_limit;
    // Parse multipart form data
    while let Ok(Some(field)) = multipart.next_field().await {
        let name = match field.name() {
            Some(name) => name.to_string(),
            None => continue,
        };

        if name == "file" {
            // Validate content type - only accept PDFs
            if let Some(content_type) = field.content_type() {
                if content_type != "application/pdf" {
                    return Err(NoteError::InvalidData("Only PDF files are supported".to_string()))?;
                }
            } else {
                return Err(NoteError::InvalidData("Content-type header not found. File type could not be determined".to_string()))?;
            }

            let data = field
                .bytes()
                .await
                .map_err(|_| NoteError::UploadFailed("Failed to read file bytes".to_string()))?;

            // Check file size (using same pattern as IQPS)
            if data.len() > FILE_SIZE_LIMIT {
                return Err(NoteError::InvalidData(format!(
                    "File size too big. Only files up to {} MiB are allowed.",
                    FILE_SIZE_LIMIT >> 20
                )))?;
            }

            file_data = Some(data);
            continue;
        }

        // Handle text fields
        let data = field.text().await.map_err(|_| {
            NoteError::UploadFailed(format!("Invalid format for field: {}", name))
        })?;

        match name.as_str() {
            "course_name" => course_name = data,
            "course_code" => course_code = data,
            "description" => {
                if !data.trim().is_empty() {
                    description = Some(data);
                }
            }
            "professor_names" => {
                let names: Vec<String> = data
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect();
                if !names.is_empty() {
                    professor_names = Some(names);
                }
            }
            "tags" => {
                tags = data
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect();
            }
            _ => (),
        }
    }

    // Validate required fields
    if course_name.trim().is_empty() {
        return Err(NoteError::InvalidData("Course name is required".to_string()))?;
    }
    if course_code.trim().is_empty() {
        return Err(NoteError::InvalidData("Course code is required".to_string()))?;
    }

    let file_bytes = file_data.ok_or(NoteError::InvalidData("File not provided".to_string()))?;

    let new_note = CreateNote {
        course_name,
        course_code,
        description,
        professor_names,
        tags,
        has_preview_image: false,
        uploader_user_id: user.id,
        timestamp: Utc::now(),
    };

    let (tx, note) = create_note(&state.db_wrapper, new_note).await.map_err(
        |err| NoteError::DatabaseError("Failed to create note".to_string(), err.into()),
    )?;

    let note_with_user = ResponseNote {
        id:    note.id,
        course_name: note.course_name,
        course_code: note.course_code,
        description: note.description,
        professor_names: note.professor_names,
        tags: note.tags,
        is_public: note.is_public,
        preview_image_url: None, // TODO: Handle preview image
        file_url: state.env_vars.paths.get_note_url(&format!("{}.pdf", note.id)).unwrap(),
        uploader_user: ResponseUser {
            id: user.id,
            google_id: user.google_id.clone(),
            email: user.email.clone(),
            full_name: user.full_name.clone(),
            reputation: user.reputation,
            created_at: user.created_at,
        },
        created_at: note.created_at,
    };

    // Create the file slug/path (similar to IQPS)
    let file_slug = state
        .env_vars
        .paths
        .get_note_slug(&format!("{}.pdf", note.id));

    // Update the note with file path in the database
    {
        let file_path = state.env_vars.paths.get_note_path_from_slug(&file_slug);

        // Ensure the directory exists
        if let Some(parent_dir) = file_path.parent() {
            if !parent_dir.exists() {
                fs::create_dir_all(parent_dir)
                    .await
                    .map_err(|_| NoteError::UploadFailed("Failed to create upload directory".to_string()))?;
            }
        }

        // Write the file data (following IQPS pattern)
        if fs::write(&file_path, &file_bytes).await.is_ok() {
            if tx.commit().await.is_ok() {
                Ok((StatusCode::CREATED, Json(note_with_user).into_response()))
            } else {
                let _ = fs::remove_file(file_path).await;
                Err(NoteError::UploadFailed("Failed to save note to database".to_string()))?
            }
        } else {
            tx.rollback().await.map_err(|_| NoteError::UploadFailed("Failed to rollback database".to_string()))?;
            Err(NoteError::UploadFailed("Failed to save file".to_string()))?
        }
    }
}
