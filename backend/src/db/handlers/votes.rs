// use crate::db::db::DBPoolWrapper;
// use uuid::Uuid;
// 
// pub async fn upvote(
//     db_wrapper: &DBPoolWrapper,
//     user_id: Uuid,
//     note_id: Uuid,
// ) -> Result<(), sqlx::Error> {
//     let mut tx = db_wrapper.pool().begin().await?;
// 
//     // Remove any existing downvote
//     sqlx::query!(
//         "DELETE FROM votes WHERE user_id = $1 AND note_id = $2 AND vote_type = 'downvote'",
//         user_id,
//         note_id
//     )
//         .execute(&mut *tx)
//         .await?;
// 
//     // Insert the upvote, or do nothing if it already exists
//     sqlx::query!(
//         "INSERT INTO votes (user_id, note_id, vote_type) VALUES ($1, $2, 'upvote') ON CONFLICT (user_id, note_id) DO NOTHING",
//         user_id,
//         note_id
//     )
//         .execute(&mut *tx)
//         .await?;
// 
//     // Update the reputation of the note's uploader
//     sqlx::query!(
//         "UPDATE users SET reputation = reputation + 1 WHERE id = (SELECT uploader_id FROM notes WHERE id = $1)",
//         note_id
//     )
//         .execute(&mut *tx)
//         .await?;
// 
//     tx.commit().await?;
// 
//     Ok(())
// }
// 
// pub async fn downvote(
//     db_wrapper: &DBPoolWrapper,
//     user_id: Uuid,
//     note_id: Uuid,
// ) -> Result<(), sqlx::Error> {
//     let mut tx = db_wrapper.pool().begin().await?;
// 
//     // Remove any existing upvote
//     sqlx::query!(
//         "DELETE FROM votes WHERE user_id = $1 AND note_id = $2 AND vote_type = 'upvote'",
//         user_id,
//         note_id
//     )
//         .execute(&mut *tx)
//         .await?;
// 
//     // Insert the downvote, or do nothing if it already exists
//     sqlx::query!(
//         "INSERT INTO votes (user_id, note_id, vote_type) VALUES ($1, $2, 'downvote') ON CONFLICT (user_id, note_id) DO NOTHING",
//         user_id,
//         note_id
//     )
//         .execute(&mut *tx)
//         .await?;
// 
//     // Update the reputation of the note's uploader
//     sqlx::query!(
//         "UPDATE users SET reputation = reputation - 1 WHERE id = (SELECT uploader_id FROM notes WHERE id = $1)",
//         note_id
//     )
//         .execute(&mut *tx)
//         .await?;
// 
//     tx.commit().await?;
// 
//     Ok(())
// }