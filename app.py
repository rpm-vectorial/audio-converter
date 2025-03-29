"""
Audio File Converter Web Application

A Flask-based web application that provides a user-friendly interface for converting audio files 
between different formats, with special support for Audible AAX files.

This module implements a web server that:
1. Accepts audio file uploads through a modern web interface
2. Supports conversion between various audio formats (WAV, MP3, OGG, M4A, FLAC)
3. Handles DRM-protected Audible AAX files using activation bytes
4. Provides secure file download functionality

The application uses:
- Flask for web server and routing
- FFmpeg for audio processing and AAX decryption
- PyDub for handling standard audio formats
- Werkzeug for secure file operations
"""

import os
from flask import Flask, request, render_template, send_file, jsonify
from werkzeug.utils import secure_filename
from pydub import AudioSegment
import uuid
import logging
import sys
import subprocess
import json

# Initialize Flask application
app = Flask(__name__)

# Configure maximum file size (1GB) to handle large audiobooks
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB max file size

# Configure logging for debugging and monitoring
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Create upload directory with absolute path
try:
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads'))
    os.makedirs(upload_dir, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_dir
    logger.info(f"Upload directory created at: {upload_dir}")
except Exception as e:
    logger.error(f"Failed to create upload directory: {str(e)}")
    sys.exit(1)

# Define allowed audio file extensions
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'm4a', 'flac', 'aax'}

def allowed_file(filename: str) -> bool:
    """
    Check if the uploaded file has an allowed extension.
    
    Args:
        filename (str): The name of the file to check
        
    Returns:
        bool: True if the file extension is allowed, False otherwise
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_aax_to_audio(input_path: str, output_format: str, activation_bytes: str) -> str:
    """
    Convert Audible AAX files to standard audio formats using FFmpeg.
    
    Args:
        input_path (str): Path to the input AAX file
        output_format (str): Desired output format (mp3/wav)
        activation_bytes (str): Audible activation bytes for DRM removal
        
    Returns:
        str: Path to the converted audio file
        
    Raises:
        subprocess.CalledProcessError: If FFmpeg conversion fails
        ValueError: If activation bytes are invalid
    """
    logger.debug(f"Converting AAX file: {input_path} to {output_format}")
    
    # Clean and validate activation bytes
    clean_activation_bytes = activation_bytes.replace('-', '').replace(' ', '').lower()
    if not clean_activation_bytes or len(clean_activation_bytes) != 8:
        raise ValueError("Invalid activation bytes format")
    
    output_path = input_path.rsplit('.', 1)[0] + f'.{output_format}'
    
    # Construct FFmpeg command with appropriate codec and quality settings
    cmd = [
        'ffmpeg', '-y',
        '-activation_bytes', clean_activation_bytes,
        '-i', input_path,
        '-c:a', 'libmp3lame' if output_format == 'mp3' else 'pcm_s16le',
        '-ab', '192k',  # Set bitrate for good quality
        '-map_metadata', '0',  # Preserve metadata
        '-id3v2_version', '3',  # Use ID3v2.3 format for better compatibility
        output_path
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        logger.debug(f"AAX conversion successful: {output_path}")
        return output_path
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg conversion failed: {e.stderr.decode()}")
        raise

def convert_audio(input_path: str, output_format: str, activation_bytes: str = None) -> str:
    """
    Convert audio files between formats. Handles both AAX and standard audio formats.
    
    Args:
        input_path (str): Path to the input audio file
        output_format (str): Desired output format
        activation_bytes (str, optional): Activation bytes for AAX files
        
    Returns:
        str: Path to the converted audio file
    """
    logger.debug(f"Converting file: {input_path} to format: {output_format}")
    
    # Handle AAX files differently
    if input_path.lower().endswith('.aax'):
        return convert_aax_to_audio(input_path, output_format, activation_bytes)
    
    # Handle standard audio formats using pydub
    audio = AudioSegment.from_file(input_path)
    output_path = input_path.rsplit('.', 1)[0] + f'.{output_format}'
    audio.export(output_path, format=output_format)
    logger.debug(f"Conversion complete. Output file: {output_path}")
    return output_path

@app.route('/')
def index():
    """
    Render the main page of the application.
    
    Returns:
        str: Rendered HTML template
    """
    logger.debug("Serving index page")
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error serving index page: {str(e)}")
        return str(e), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Handle file uploads and conversion requests.
    
    Expects:
        - File in request.files['file']
        - Format in request.form['format']
        - Activation bytes in request.form['activation_bytes'] for AAX files
        
    Returns:
        JSON: Success status and download URL or error message
    """
    logger.debug("Upload endpoint called")
    logger.debug(f"Files in request: {request.files}")
    logger.debug(f"Form data: {request.form}")

    if 'file' not in request.files:
        logger.error("No file part in request")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        logger.error("No selected file")
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        logger.error(f"File type not allowed: {file.filename}")
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        logger.debug(f"Saving file to: {input_path}")
        file.save(input_path)
        
        # Get target format and activation bytes from request
        target_format = request.form.get('format', 'mp3')
        activation_bytes = request.form.get('activation_bytes')
        
        logger.debug(f"Target format: {target_format}")
        if activation_bytes:
            logger.debug(f"Activation bytes provided: {activation_bytes}")
        
        output_path = convert_audio(input_path, target_format, activation_bytes)
        download_url = f'/download/{os.path.basename(output_path)}'
        logger.debug(f"Download URL: {download_url}")
        
        # Clean up input file if it's different from output
        if os.path.abspath(input_path) != os.path.abspath(output_path):
            os.remove(input_path)
        
        return jsonify({
            'success': True,
            'download_url': download_url
        })
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>')
def download_file(filename):
    """
    Serve converted files for download.
    
    Args:
        filename (str): Name of the file to download
        
    Returns:
        Response: File download response or error message
    """
    logger.debug(f"Download requested for file: {filename}")
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logger.debug(f"Full file path: {file_path}")
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return jsonify({'error': 'File not found'}), 404
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        logger.error(f"Error serving download: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.after_request
def after_request(response):
    """
    Add CORS headers to all responses.
    
    Args:
        response: Flask response object
        
    Returns:
        Response: Modified response with CORS headers
    """
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response

if __name__ == '__main__':
    try:
        # Check if ffmpeg is installed
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True)
        except FileNotFoundError:
            logger.error("ffmpeg not found. Please install it first.")
            print("\nPlease install ffmpeg first. On macOS, you can use:")
            print("brew install ffmpeg")
            sys.exit(1)
            
        logger.info("Starting Flask application...")
        app.run(debug=True, host='127.0.0.1', port=5002)
    except Exception as e:
        logger.error(f"Failed to start Flask application: {str(e)}")
        sys.exit(1) 