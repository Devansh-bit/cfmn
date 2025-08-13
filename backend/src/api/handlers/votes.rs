// use crate::api::errors::AppError;
// use crate::api::router::RouterState;
// use crate::db::handlers::votes::{downvote, upvote};
// use crate::db::models::User;
// use axum::{
//     extract::{Path, State},
//     http::StatusCode,
//     response::{IntoResponse, Response},
//     Extension, Json,
// };
// use serde::Deserialize;
// use uuid::Uuid;
//
// #[derive(Deserialize)]
// pub struct VoteRequest {
//     user_id: Uuid,
// }
//
// pub async fn upvote_handler(
//     State(state): State<RouterState>,
//     Extension(user): Extension<User>,
//     Path(note_id): Path<Uuid>,
// ) -> Result<impl IntoResponse, AppError> {
//     match upvote(&state.db_wrapper, user.id, note_id).await {
//         Ok(_) => Ok(StatusCode::OK),
//         Err(e) => {
//             tracing::error!("Failed to upvote note: {}", e);
//             Err(AppError::Note(
//                 crate::api::errors::NoteError::DatabaseError(
//                     "Failed to upvote note".to_string(),
//                     e.into(),
//                 ),
//             ))
//         }
//     }
// }
//
// pub async fn downvote_handler(
//     State(state): State<RouterState>,
//     Extension(user): Extension<User>,
//     Path(note_id): Path<Uuid>,
// ) -> Result<impl IntoResponse, AppError> {
//     match downvote(&state.db_wrapper, user.id, note_id).await {
//         Ok(_) => Ok(StatusCode::OK),
//         Err(e) => {
//             tracing::error!("Failed to downvote note: {}", e);
//             Err(AppError::Note(
//                 crate::api::errors::NoteError::DatabaseError(
//                     "Failed to downvote note".to_string(),
//                     e.into(),
//                 ),
//             ))
//         }
//     }
// }
