use clap::Parser;

#[derive(Parser, Clone)]
#[clap(name = "")]
pub struct EnvVars {
    #[arg(env)]
    pub database_url: String,
    #[arg(env)]
    pub google_client_id: String,
    #[arg(env)]
    pub google_client_secret: String,
    #[arg(env)]
    pub signing_secret: String,
    #[arg(env)]
    pub expiration_time_seconds: i64,
}
