// backend/src/api/auth.rs

use axum::extract::{Request, State};
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use crate::api::router::RouterState;
use axum_extra::extract::cookie::{Cookie, CookieJar};
use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::collections::BTreeMap;
use axum::body::Body;
use axum::{debug_handler, Json};
use jsonwebtoken::{decode, DecodingKey, Validation};
use crate::api::errors;
use crate::api::errors::{AppError, AuthError};
use crate::db;
use crate::db::handlers::users::GoogleUserInfo;
use crate::db::models::User;
use serde_json::json;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppClaims {
    pub(crate) google_id: String,
    pub(crate) exp: i64,
}

pub async fn verify_token(token: &str, state: &RouterState) -> Result<Option<User>, AppError> {
    let decoding_key = DecodingKey::from_secret(state.env_vars.signing_secret.as_bytes());

    let validation = Validation::new(jsonwebtoken::Algorithm::HS256);

    let token_data = decode::<AppClaims>(token, &decoding_key, &validation)
        .map_err(|_| AuthError::InvalidToken("Invalid or expired session token".to_string()))?;

    let claims = token_data.claims;

    let user = db::handlers::users::find_user_by_google_id(&state.db_wrapper, &claims.google_id)
        .await
        .map_err(|e| AuthError::DatabaseError("Failed to fetch user".to_string(), e.into()))?;

    Ok(user)
}


pub(crate) async fn verify_token_middleware(
    State(state): State<RouterState>,
    mut request: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    // Look for Authorization header instead of cookie
    let auth_header = request
        .headers()
        .get("authorization")
        .and_then(|header| header.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "));

    if let Some(token) = auth_header {
        let user = match verify_token(token, &state).await? {
            Some(user) => user,
            None => {
                tracing::debug!("Token verification failed");
                return Ok(Response::builder()
                    .status(StatusCode::UNAUTHORIZED)
                    .header("Content-Type", "application/json")
                    .body(Body::from(r#"{"error": "Invalid token"}"#))
                    .unwrap());
            }
        };
        request.extensions_mut().insert(user);
        tracing::debug!("Valid token found for user");
    } else {
        tracing::debug!("No Authorization header found");
        return Ok(Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .header("Content-Type", "application/json")
            .body(Body::from(r#"{"error": "Missing authorization header"}"#))
            .unwrap());
    }

    Ok(next.run(request).await)
}
