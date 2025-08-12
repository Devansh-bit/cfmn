// backend/src/api/handlers/auth.rs
use crate::api::errors::AppError;
use crate::api::router::RouterState;
use crate::db::handlers::users::{find_or_create_user, GoogleUserInfo};
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use jsonwebtoken::{decode, decode_header, DecodingKey, Validation};
use reqwest;
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Deserialize)]
pub struct AuthRequest {
    token: String,
}

#[derive(Debug, Deserialize)]
struct GoogleClaims {
    email: String,
    name: String,
    sub: String, // This is the Google ID
}

// Structs to represent the JSON Web Key Set (JWKS) from Google
#[derive(Debug, Deserialize)]
struct Jwks {
    keys: Vec<Jwk>,
}

#[derive(Debug, Deserialize)]
struct Jwk {
    kid: String,
    n: String,
    e: String,
}


/// Fetches Google's public keys for verifying ID tokens.
async fn get_google_public_keys() -> Result<HashMap<String, DecodingKey>, AppError> {
    let response = reqwest::get("https://www.googleapis.com/oauth2/v3/certs")
        .await
        .map_err(|e| {
            AppError::User(crate::api::errors::UserError::Reqwest(
                "Failed to fetch Google public keys".to_string(),
                e.into(),
            ))
        })?;

    if !response.status().is_success() {
        return Err(AppError::User(crate::api::errors::UserError::Unknown(
            "Failed to fetch Google public keys".to_string(),
            sqlx::Error::Configuration("Request to Google was not successful".into()),
        )));
    }

    let jwks: Jwks = response.json().await.map_err(|e| {
        AppError::User(crate::api::errors::UserError::Reqwest(
            "Failed to parse Google public keys".to_string(),
            e.into(),
        ))
    })?;

    let mut decoding_keys = HashMap::new();
    for jwk in jwks.keys {
        decoding_keys.insert(
            jwk.kid,
            DecodingKey::from_rsa_components(&jwk.n, &jwk.e).map_err(|e| {
                AppError::User(crate::api::errors::UserError::Unknown(
                    "Failed to create decoding key".to_string(),
                    sqlx::Error::Tls(e.into()),
                ))
            })?,
        );
    }
    Ok(decoding_keys)
}

pub async fn google_auth_callback(
    State(state): State<RouterState>,
    Json(payload): Json<AuthRequest>,
) -> Result<(StatusCode, Response), AppError> {
    let header = decode_header(&payload.token).map_err(|_| {
        AppError::User(crate::api::errors::UserError::Unknown(
            "Invalid token header".to_string(),
            sqlx::Error::Configuration("Invalid token header".into()),
        ))
    })?;

    let kid = header.kid.ok_or_else(|| {
        AppError::User(crate::api::errors::UserError::Unknown(
            "Missing 'kid' in token header".to_string(),
            sqlx::Error::Configuration("Missing 'kid' in token header".into()),
        ))
    })?;

    let public_keys = get_google_public_keys().await?;
    let decoding_key = public_keys.get(&kid).ok_or_else(|| {
        AppError::User(crate::api::errors::UserError::Unknown(
            "No matching public key found for 'kid'".to_string(),
            sqlx::Error::Configuration("No matching public key found for 'kid'".into()),
        ))
    })?;

    let google_client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|_| {
            AppError::User(crate::api::errors::UserError::Unknown(
                "GOOGLE_CLIENT_ID not set".to_string(),
                sqlx::Error::Configuration("GOOGLE_CLIENT_ID not set".into()),
            ))
        })?;

    let mut validation = Validation::new(header.alg);
    validation.set_audience(&[google_client_id]);

    let token_data = decode::<GoogleClaims>(&payload.token, decoding_key, &validation).map_err(|e| {
        tracing::error!("Token validation error: {}", e);
        AppError::User(crate::api::errors::UserError::Unknown(
            "Token validation failed".to_string(),
            sqlx::Error::Tls(e.into()),
        ))
    })?;

    let claims = token_data.claims;

    let user_info = GoogleUserInfo {
        google_id: claims.sub,
        email: claims.email,
        full_name: claims.name,
    };

    let user = find_or_create_user(&state.db_wrapper, user_info)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(err) if err.constraint() == Some("users_google_id_key") => {
                AppError::User(crate::api::errors::UserError::Conflict(
                    "User with this Google ID already exists".to_string(),
                    sqlx::Error::Database(err),
                ))
            }
            e => AppError::User(crate::api::errors::UserError::Unknown(
                "Failed to find or create user".to_string(),
                e,
            )),
        })?;

    Ok((StatusCode::OK, Json(user).into_response()))
}