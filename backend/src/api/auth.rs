use axum::extract::{Request, State};
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::Response;
use crate::api::router::RouterState;
use axum_extra::extract::cookie::CookieJar;
use hmac::{Hmac, Mac};
use jwt::VerifyWithKey;
use reqwest::Client;
use sha2::Sha256;
use std::collections::BTreeMap;
use axum::body::Body;
use crate::api::errors;
use crate::api::errors::AppError;
use crate::db;
use crate::db::models::User;

async fn verify_token(token: &String, state: &RouterState) -> Result<Option<User>, AppError> {
    let key: Hmac<Sha256> =
        Hmac::new_from_slice(state.env_vars.signing_secret.as_bytes()).unwrap();
    let claims: BTreeMap<String, String> = token.verify_with_key(&key).map_err(|_| {
        errors::AuthError::InvalidToken("Invalid JWT token".to_string())
    })?;
    let google_id = claims.get("google_id").unwrap();
    let access_token = claims.get("access_token").unwrap();

    let auth_test_url = format!("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={}", access_token);
    let req = Client::new()
        .get(auth_test_url)
        .build().map_err(|e| {
        errors::AuthError::ConfigError("Failed to build auth request".to_string())
    })?;
    let response = Client::new().execute(req).await.map_err(|e| {
        errors::AuthError::RequestError("Auth request failed".to_string(), e.into())
    })?;

    if response.status() != StatusCode::OK {
        return Ok(None);
    }

    let user = db::handlers::users::find_user_by_google_id(&state.db_wrapper, google_id).await.map_err(|e| {;
        errors::AuthError::DatabaseError("Failed to fetch user from database".to_string(), e.into())
    })?;

    Ok(user)
}
pub(crate) async fn verify_token_middleware(
    State(state): State<RouterState>,
    jar: CookieJar,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    if let Some(token) = jar.get("token").map(|cookie| cookie.value().to_owned()) {
        let user = match verify_token(&token, &state).await? {
            Some(user) => user,
            None => {
                tracing::debug!("Token verification failed, redirecting to login");
                return Ok(Response::builder()
                    .status(StatusCode::TEMPORARY_REDIRECT)
                    .header("Location", "/login")
                    .body(Body::empty())
                    .unwrap());
            }
        };
        request.extensions_mut().insert(user);
        tracing::debug!("Token found: {}", token);
    } else {
        tracing::debug!("No token found, redirecting to login");
        return Ok(Response::builder()
            .status(StatusCode::TEMPORARY_REDIRECT)
            .header("Location", "/login")
            .body(Body::empty())
            .unwrap());
    }

    Ok(next.run(request).await)
}