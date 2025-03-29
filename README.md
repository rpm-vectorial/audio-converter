# Audio File Converter Web Application

A Flask-based web application that provides a user-friendly interface for converting audio files between different formats, with special support for Audible AAX files.

## Overview

This application allows users to:
- Upload audio files through a modern, dark-themed web interface
- Convert between various audio formats (WAV, MP3, OGG, M4A, FLAC)
- Convert DRM-protected Audible AAX files using activation bytes
- Download the converted audio files

## Technical Architecture

### Core Technologies

1. **Flask** (`flask`):
   - Web framework for handling HTTP requests and serving the application
   - Manages file uploads, downloads, and routing
   - Provides template rendering for the web interface

2. **FFmpeg**:
   - External dependency for audio processing
   - Handles AAX decryption and format conversion
   - Required for processing DRM-protected Audible files

3. **PyDub** (`pydub`):
   - Python library for audio processing
   - Handles conversion of non-AAX audio formats
   - Provides high-level audio manipulation capabilities

### Key Components

#### 1. Package Dependencies
```python
from flask import Flask, request, render_template, send_file, jsonify
from werkzeug.utils import secure_filename
from pydub import AudioSegment
```
- `Flask`: Core web framework
- `werkzeug.utils`: Provides secure filename handling
- `pydub`: Audio processing library
- Standard libraries: `os`, `uuid`, `logging`, `sys`, `subprocess`, `json`

#### 2. Configuration
```python
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB max file size
```
- Configures upload directory and file size limits
- Sets up logging for debugging and error tracking

#### 3. File Format Support
```python
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'm4a', 'flac', 'aax'}
```
- Defines supported audio formats
- Includes special support for Audible AAX files

### Core Functions

#### 1. AAX Conversion (`convert_aax_to_audio`)
```python
def convert_aax_to_audio(input_path, output_format, activation_bytes):
```
- Handles conversion of DRM-protected AAX files
- Uses FFmpeg with activation bytes for decryption
- Supports conversion to MP3 or WAV formats
- Preserves metadata and ensures quality settings

Parameters:
- `input_path`: Path to the input AAX file
- `output_format`: Desired output format (mp3/wav)
- `activation_bytes`: Audible activation bytes for DRM removal

#### 2. General Audio Conversion (`convert_audio`)
```python
def convert_audio(input_path, output_format, activation_bytes=None):
```
- Routes AAX files to specialized conversion
- Uses PyDub for standard audio format conversion
- Handles cleanup of temporary files

#### 3. File Upload Handler (`upload_file`)
```python
@app.route('/upload', methods=['POST'])
def upload_file():
```
- Processes file uploads via HTTP POST
- Validates file types and handles errors
- Manages conversion process
- Returns download URL for converted file

#### 4. File Download Handler (`download_file`)
```python
@app.route('/download/<filename>')
def download_file(filename):
```
- Serves converted files for download
- Implements secure file serving
- Handles error cases

### Security Features

1. **File Security**:
   - Secure filename generation using UUID
   - File type validation
   - Maximum file size limits

2. **Error Handling**:
   - Comprehensive logging
   - User-friendly error messages
   - Cleanup of temporary files

3. **CORS Support**:
   - Cross-Origin Resource Sharing headers
   - Allows for flexible client integration

### Web Interface

The application provides a modern, dark-themed web interface with:
- Drag-and-drop file upload
- Format selection
- Activation bytes input for AAX files
- Progress feedback
- Download link generation

## Setup and Dependencies

### System Requirements
1. Python 3.7 or higher
2. FFmpeg installation
3. Sufficient disk space for audio processing

### Installation
1. Install FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

2. Install Python dependencies:
```bash
pip install flask pydub werkzeug
```

### Running the Application
```bash
python app.py
```
Access the web interface at: `http://127.0.0.1:5002`

## Error Handling

The application implements comprehensive error handling:
- File type validation
- Size limit enforcement
- Conversion error catching
- User feedback through the UI
- Detailed server-side logging

## Logging

Implements detailed logging for debugging and monitoring:
- Request tracking
- Conversion process details
- Error reporting
- File operation tracking

## Security Considerations

1. **File Handling**:
   - Secure filename generation
   - Type validation
   - Size limits
   - Temporary file cleanup

2. **User Input**:
   - Input validation
   - Secure file paths
   - Error handling

3. **System Integration**:
   - FFmpeg dependency checking
   - Safe subprocess execution
   - Resource cleanup

## Performance Considerations

1. **File Size**:
   - 1GB maximum file size limit
   - Suitable for large audiobooks
   - Configurable limits

2. **Processing**:
   - Efficient file handling
   - Proper resource cleanup
   - Progress feedback

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit pull requests. 