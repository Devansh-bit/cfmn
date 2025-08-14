use std::path::PathBuf;
use clap::Parser;
use crate::pathutils::Paths;

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
    #[arg(env)]
    pub file_size_limit: usize,

    // Paths
    #[arg(env, default_value = "http://localhost:8081")]
    /// The URL of the static files server (odin's vault)
    static_files_url: String,
    #[arg(env, default_value = "/home/exempl4r/coding/static")]
    /// The path where static files are served from
    static_file_storage_location: PathBuf,
    #[arg(env, default_value = "notes/uploaded")]
    /// The path where uploaded notes are stored temporarily, relative to the `static_file_storage_location`
    uploaded_notes_path: PathBuf,
    #[arg(env, default_value = "previews/uploaded")]
    /// The path where uploaded notes are stored temporarily, relative to the `static_file_storage_location`
    previews_path: PathBuf,

    #[arg(skip)]
    /// All paths must be handled using this
    pub paths: Paths,
}

impl EnvVars {
    /// Processes the environment variables after reading, initializing the Paths struct.
    pub fn process(mut self) -> Result<Self, color_eyre::eyre::Error> {
        self.paths = Paths::new(
            &self.static_files_url,
            &self.static_file_storage_location,
            &self.uploaded_notes_path,
            &self.previews_path,
        )?;

        Ok(self)
    }
}