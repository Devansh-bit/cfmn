/// Derived from https://github.com/metakgp/iqps-go

use std::{
    fs,
    path::{self, Path, PathBuf},
};

use color_eyre::eyre::eyre;
use url::Url;

#[derive(Clone)]
/// Struct containing all the paths and URLs required to parse or create any note's slug, absolute path, or URL.
pub struct Paths {
    /// URL of the static files server
    static_files_url: Url,
    /// The absolute path to the location from where the static files server serves files
    static_files_path: PathBuf,
    /// The absolute system path to the notes directory on the server
    notes_system_path: PathBuf,
    /// The slug to the notes directory
    ///
    /// A slug is a relative path independent of the URL or system path. This slug is stored in the database
    /// and either the [`static_files_url`] or the [`static_files_path`] is prepended to it to get its URL
    /// (to send to the frontend) or the system path (for backend operations)
    notes_path_slug: PathBuf,
}

impl Default for Paths {
    fn default() -> Self {
        Self {
            static_files_url: Url::parse("http://localhost:8081")
                .expect("Default localhost URL should be valid"),
            static_files_path: PathBuf::from("./static_files"),
            notes_system_path: PathBuf::from("./static_files/notes/uploaded"),
            notes_path_slug: PathBuf::from("notes/uploaded"),
        }
    }
}

impl Paths {
    /// Creates a new `Paths` struct for notes
    ///
    /// # Arguments
    /// * `static_files_url` - The static files server URL (eg: https://static.metakgp.org or http://localhost:8081)
    /// * `static_file_storage_location` - The path to the location on the server from which the static files are served (eg: /srv/static or ./static_files)
    /// * `uploaded_notes_relative_path` - The path to the uploaded notes, relative to the static files storage location (eg: /notes/uploaded)
    pub fn new(
        static_files_url: &str,
        static_file_storage_location: &Path,
        uploaded_notes_relative_path: &Path,
    ) -> Result<Self, color_eyre::eyre::Error> {
        // The slug for the notes directory
        let notes_path_slug = uploaded_notes_relative_path.to_owned();

        // The absolute system path for the notes directory
        let notes_system_path = path::absolute(static_file_storage_location.join(&notes_path_slug))?;
        // Create the notes directory if it doesn't exist
        if !notes_system_path.exists() {

            fs::create_dir_all(&notes_system_path)?;
        }

        Ok(Self {
            static_files_url: Url::parse(static_files_url)?,
            static_files_path: path::absolute(static_file_storage_location)?,
            notes_system_path,
            notes_path_slug,
        })
    }

    /// TODO: Functions for handling preview images

    /// Returns the slug for a given filename
    ///
    /// Example: `get_note_slug("123.pdf")` returns `"notes/uploaded/123.pdf"`
    pub fn get_note_slug(&self, filename: &str) -> String {
        self.notes_path_slug
            .join(filename)
            .to_string_lossy()
            .to_string()
    }

    /// Returns the absolute system path for the specified filename
    ///
    /// Example: `get_note_path("123.pdf")` returns `/srv/static/notes/uploaded/123.pdf`
    pub fn get_note_path(&self, filename: &str) -> PathBuf {
        self.notes_system_path.join(filename)
    }

    /// Returns the absolute system path from a given slug
    ///
    /// Example: `get_note_path_from_slug("notes/uploaded/123.pdf")` returns `/srv/static/notes/uploaded/123.pdf`
    pub fn get_note_path_from_slug(&self, slug: &str) -> PathBuf {
        self.static_files_path.join(slug)
    }

    /// Returns the static server URL for the specified filename
    ///
    /// Example: `get_note_url("123.pdf")` returns `"https://static.metakgp.org/notes/uploaded/123.pdf"`
    pub fn get_note_url(&self, filename: &str) -> Result<String, color_eyre::eyre::Error> {
        let slug = self.get_note_slug(filename);
        self.get_note_url_from_slug(&slug)
    }

    /// Returns the static server URL for a given slug
    ///
    /// Example: `get_note_url_from_slug("notes/uploaded/123.pdf")` returns `"https://static.metakgp.org/notes/uploaded/123.pdf"`
    pub fn get_note_url_from_slug(&self, slug: &str) -> Result<String, color_eyre::eyre::Error> {
        Ok(self.static_files_url.join(slug)?.as_str().to_string())
    }

    /// Returns the notes directory path for creating subdirectories if needed
    pub fn get_notes_dir(&self) -> &Path {
        &self.notes_system_path
    }

    /// Removes any non-alphanumeric character and replaces whitespaces with `-`
    /// Also replaces `/` with `-` and multiple spaces or hyphens will be replaced with a single one
    ///
    /// Useful for sanitizing filenames or course names for file storage
    pub fn sanitize_filename(filename: &str) -> String {
        filename
            .replace('/', "-") // Replace specific characters with a `-`
            .replace('-', " ") // Convert any series of spaces and hyphens to just spaces
            .split_whitespace() // Split at whitespaces to later replace all whitespaces with `-`
            .map(|part| {
                part.chars()
                    .filter(|&character| {
                        character.is_alphanumeric() || character == '-' || character == '_' || character == '.'
                    }) // Remove any character that is not a `-`, `.`, `_`, or alphanumeric
                    .collect::<String>()
            })
            .collect::<Vec<String>>()
            .join("-") // Join the parts with `-`
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_slug_generation() {
        let paths = Paths::default();
        assert_eq!(paths.get_note_slug("test.pdf"), "notes/uploaded/test.pdf");
    }

    #[test]
    fn test_url_generation() {
        let paths = Paths::default();
        let url = paths.get_note_url("test.pdf").unwrap();
        assert_eq!(url, "http://localhost:8081/notes/uploaded/test.pdf");
    }

    #[test]
    fn test_filename_sanitization() {
        assert_eq!(Paths::sanitize_filename("CS/IT 101 - Final Exam.pdf"), "CS-IT-101-Final-Exam.pdf");
        assert_eq!(Paths::sanitize_filename("Math@#$%^&*()_notes.pdf"), "Math_notes.pdf");
        assert_eq!(Paths::sanitize_filename("   spaced   out   .pdf"), "spaced-out-.pdf");
    }
}