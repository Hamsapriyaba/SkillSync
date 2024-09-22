import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image, ImageFilter
from transformers import pipeline


app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# If on Windows, set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# OCR route for extracting text from image
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Save the image file
    image_path = os.path.join("uploads", file.filename)
    file.save(image_path)

    try:
        # Load and preprocess the image
        img = Image.open(image_path)
        img = img.convert('L')  # Convert to grayscale
        img = img.filter(ImageFilter.SHARPEN)  # Optional: sharpen the image

        # Perform OCR on the image
        extracted_text = pytesseract.image_to_string(img)
        logging.debug(f"Extracted text: {extracted_text}")

        if not extracted_text.strip():
            return jsonify({"error": "No text extracted from the image"}), 400

        return jsonify({"text": extracted_text}), 200
    except Exception as e:
        logging.error(f"Error processing the image: {e}")
        return jsonify({"error": f"Error processing the image: {str(e)}"}), 500
# Summarization route
@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    text = data.get('text', '')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Use Hugging Face's pipeline for summarization
        summarizer = pipeline("summarization")
        summary = summarizer(text, max_length=100, min_length=30, do_sample=False)
        return jsonify({"summary": summary[0]['summary_text']}), 200
    except Exception as e:
        return jsonify({"error": f"Error during summarization: {str(e)}"}), 500

if __name__ == '__main__':
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    app.run(debug=True)
