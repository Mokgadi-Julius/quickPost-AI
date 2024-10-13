from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import google.generativeai as genai
import base64
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import logging
import re

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables and configure Gemini API
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=GEMINI_API_KEY)

# Print the API key for debugging (remove in production)
print(f"GEMINI_API_KEY: {GEMINI_API_KEY[:5]}...")  # Print first 5 chars for safety

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_DIR = os.path.join(BASE_DIR, "prompts")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/prompt-files', methods=['GET'])
def get_prompt_files():
    try:
        prompt_files = [f for f in os.listdir(PROMPT_DIR) if f.endswith('.txt')]
        logging.info(f"Found prompt files: {prompt_files}")
        return jsonify({"files": prompt_files})
    except Exception as e:
        logging.error(f"Error getting prompt files: {str(e)}")
        return jsonify({"error": f"Failed to get prompt files: {str(e)}"}), 500

@app.route('/api/generate', methods=['POST'])
def generate_content():
    if 'prompt' not in request.form or 'image' not in request.files or 'trendUrl' not in request.form or 'platform' not in request.form:
        return jsonify({"error": "Missing required fields"}), 400

    prompt_file = request.form['prompt']
    image = request.files['image']
    trend_url = request.form['trendUrl']
    platform = request.form['platform']

    if not allowed_file(image.filename):
        return jsonify({"error": "Invalid file type"}), 400

    try:
        filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(image_path)

        # Initial content generation
        initial_content = generate_content_with_image(os.path.join(PROMPT_DIR, prompt_file), image_path)
        logging.info(f"Initial content generated: {initial_content[:100]}...")  # Log first 100 chars
        
        # Scrape website content
        scraped_content = scrape_trends(trend_url)
        logging.info("Content scraped from URL")
        
        # Use AI to extract top 5 trends
        trends = extract_trends(scraped_content)
        logging.info(f"AI-extracted trends: {trends}")
        
        if not trends:
            return jsonify({"error": "No trends were found"}), 400
        
        # Generate final content based on the platform
        platform_prompt = get_platform_prompt(platform)
        final_content = generate_final_content(platform_prompt, initial_content, trends, platform)
        
        # Combine generated content with trends
        final_output = combine_content_and_trends(final_content, trends, platform)
        
        return jsonify({"content": final_output})

    except Exception as e:
        logging.error(f"Error in content generation: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_content_with_image(prompt_file_path, image_file_path):
    with open(prompt_file_path, "r") as prompt_file:
        prompt = prompt_file.read()

    mime_type = "image/jpeg" if image_file_path.lower().endswith(('.jpg', '.jpeg')) else "image/png"
    with open(image_file_path, "rb") as f:
        image_data = f.read()
    base64_encoded_image = base64.b64encode(image_data).decode("utf-8")

    model = genai.GenerativeModel(model_name='gemini-1.5-flash')
    response = model.generate_content(
        contents=[
            {"text": prompt},
            {"mime_type": mime_type, "data": base64_encoded_image}
        ]
    )
    return response.text

def scrape_trends(url):
    logging.info(f"Scraping trends from {url}")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract all text from the page
        all_text = soup.get_text()
        
        # Remove extra whitespace and split into words
        words = ' '.join(all_text.split())
        
        return words
    except requests.RequestException as e:
        logging.error(f"Error scraping trends: {e}")
        return ""

def extract_trends(scraped_content):
    model = genai.GenerativeModel(model_name='gemini-1.5-flash')
    trends_response = model.generate_content(
        f"Given the following content from a trends website:\n\n{scraped_content}\n\n"
        f"Please identify and list the FIRST 5 current trending topics or hashtags. "
        f"Return only the list of 5 trends, one per line, without any additional text or numbering. "
        f"Preserve the original format of each trend (with or without hashtag)."
    )
    trends = trends_response.text.strip().split('\n')
    return trends[:5]  # Ensure we only get the top 5 trends

def get_platform_prompt(platform):
    if platform == 'Twitter':
        return "Create a concise and engaging tweet (max 280 characters) based on the initial content. Do not include any hashtags or trends in your response."
    elif platform == 'LinkedIn Post':
        return "Write a professional LinkedIn post (300-600 characters) that incorporates the initial content. Do not include any hashtags or trends in your response."
    elif platform == 'LinkedIn Article':
        return "Develop an outline for a LinkedIn article (500-1000 words) based on the initial content. Include an attention-grabbing headline, 3-5 main points, and a call-to-action. Do not include any hashtags or trends in your response."
    elif platform == 'Blog':
        return "Create a detailed blog post outline (800-1500 words) that expands on the initial content. Include an engaging title, introduction, 3-5 main sections with subheadings, and a conclusion with a call-to-action. Do not include any hashtags or trends in your response."
    else:
        return "Generate content based on the initial input. Do not include any hashtags or trends in your response."

def generate_final_content(platform_prompt, initial_content, trends, platform):
    model = genai.GenerativeModel(model_name='gemini-1.5-flash')
    response = model.generate_content(
        f"{platform_prompt}\n\nInitial content: {initial_content}\n\nTrends: {', '.join(trends)}"
    )
    return response.text

def combine_content_and_trends(content, trends, platform):
    # Remove any accidentally generated hashtags or mentions
    content = re.sub(r'#\w+|@\w+', '', content)
    
    # Trim whitespace and ensure proper capitalization
    content = content.strip().capitalize()
    
    # Add trends
    trend_string = ' | '.join(trends)
    
    if platform == 'Twitter':
        max_length = 280 - len(trend_string) - 3  # 3 for ' | ' separator
        if len(content) > max_length:
            content = content[:max_length-3] + '...'
        final_output = f"{content} | {trend_string}"
    elif platform == 'LinkedIn Post':
        max_length = 3000 - len(trend_string) - 2  # 2 for '\n\n' separator
        if len(content) > max_length:
            content = content[:max_length-3] + '...'
        final_output = f"{content}\n\n{trend_string}"
    else:
        final_output = f"{content}\n\nTrends: {trend_string}"
    
    return final_output

if __name__ == '__main__':
    os.makedirs(PROMPT_DIR, exist_ok=True)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=False)
