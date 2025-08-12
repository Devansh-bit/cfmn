use crate::api::router::RouterState;
use crate::db::models::Note;
use axum::{extract::State, http::StatusCode, Json};

pub async fn list_notes(
    State(db_pool): State<RouterState>,
) -> Result<Json<Vec<Note>>, (StatusCode, String)> {
    // let notes = sqlx::query_as::<_, Note>("SELECT * FROM notes")
    //     .fetch_all(&db_pool)
    //     .await
    //     .map_err(|err| {
    //         tracing::error!("Failed to fetch notes: {}", err);
    //         (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch notes".to_string())
    //     })?;
    // 
    // Ok(Json(notes))
    todo!()
}

pub async fn upload_note() -> (StatusCode, &'static str) {
    // TODO: Implement file upload logic
    (StatusCode::NOT_IMPLEMENTED, "Upload not implemented yet")
}
