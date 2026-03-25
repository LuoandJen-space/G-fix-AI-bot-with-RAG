from flask import Flask, request, jsonify, render_template
from flask_cors import CORS #approve cross font and endpoint connection
from groq import Groq #import the Groq client library
from dotenv import load_dotenv #load environment variables from .env file
import os

basedir = os.path.abspath(os.path.dirname(__file__))
env_path = os.path.join(basedir, '.env') #env file path
load_dotenv(env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found. Please check your .env file.")
client = Groq(api_key=GROQ_API_KEY) #initialize the Groq client with the API key
app = Flask(__name__)

# allow cross-origin requests from any domain, and support credentials (like cookies)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
try:
    with open("faq.txt", "r", encoding="utf-8") as f:
        faq_data = f.read() # read top FAQ data from faq.txt file
except FileNotFoundError:
    faq_data = "No FAQ data available."

#route check if server is running
@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "Flask Server is Running"})

#core logic for handling chat requests.
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    #process preflight OPTIONS request for CORS
    if request.method == "OPTIONS":
        return "", 200
    print("📡 Request received")
    try:
        data = request.json #get the font data message
        user_message = data.get("message")
        if not user_message:
            return jsonify({"reply": "Please enter a message."})
        
        #Calling Groq models
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b", #Use the specified model
            messages=[
                #system roal definde
                {"role": "system", "content": f"You are a professional phone repair assistant. Business context: {faq_data}"},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7, #control the randomness
            max_tokens=1024,
            stream=False #do not use streaming responses for simplicity
        )
        #completion response contains whole replay
        #.choies[0] is choose the firsr ai response
        #.message Get the reply object containing the character and content
        #.content only get the text content of the reply
        reply = completion.choices[0].message.content
        
        # key words trigger to show repair card
        trigger_keywords = ["Repair", "Query", "Repair No.", "Status", "Order"]
        show_card = any(keyword in reply.lower() for keyword in trigger_keywords)
        return jsonify({
            "reply": reply,
            "show_repair_card": show_card
        })
    
    except Exception as e:
        print(f"Groq API Error: {e}")
        return jsonify({"reply": f"Error: {str(e)}", "show_repair_card": False})
    
if __name__ == '__main__':
    print("🚀 Backend server is starting...")
    app.run(debug=True, port=5000, host='0.0.0.0')