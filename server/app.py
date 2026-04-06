from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq 
from dotenv import load_dotenv 
import os
import json 
import faiss #高效的向量搜索库 for RAG
import numpy as np
from sentence_transformers import SentenceTransformer #将文本转换为向量的库
from utils.security import validate_and_clean

# Get absolute path of the server directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Define data directory path
DATA_DIR = os.path.join(BASE_DIR, "data")
#config_path = os.path.join(DATA_DIR, "config.json")
CONFIG_PATH = os.path.join(DATA_DIR, "config.json")
#load .env file
INDEX_PATH = os.path.join(DATA_DIR, "faq_index.faiss")
METADATA_PATH = os.path.join(DATA_DIR, "faq_metadata.json")

load_dotenv(os.path.join(BASE_DIR, '.env'))

# load config.json
def load_config_data():
    try:
        #config_path = os.path.join(DATA_DIR, "config.json")
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            print("✅ config.json file is loaded.")
            return data
    except Exception as e:
        print(f"❌ Error loading config.json: {e}")
        return {} # fallback to empty dict if loading fails

# initialize RAG components
def init_rag_system():
    print("RAG system initializing... This may take a moment.")
    try:
        # load RAG model
        rag_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        # load faiss index and metadata
        if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):#向量数据库文件路径
            faq_index = faiss.read_index(INDEX_PATH) #read faiss index
            with open(METADATA_PATH, "r", encoding="utf-8") as f: 
                faq_metadata = json.load(f) #read metadata #对应文字内容
            print("✅ RAG index and metadata loaded successfully.")
        else:
            print("⚠️ Warning: Index files not found. Please run ingest.py to create them.")
            faq_index = None
            faq_metadata = []
    except Exception as e:
        print(f"❌ RAG initialization error: {e}")
        faq_index = None
        faq_metadata = []
    return rag_model, faq_index, faq_metadata

business_config = load_config_data()

# 注意：这里可以根据环境变量决定是否加载模型
# 在跑 pytest 时，通常不需要加载 RAG 资源
if os.getenv("ENV") != "testing":
    rag_model, faq_index, faq_metadata = init_rag_system()
else:
    rag_model, faq_index, faq_metadata = None, None, []

#initialize Flask app
app = Flask(__name__)
CORS(app)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Helper function to safely get price info with error handling.
def get_price_safe(data, brand, model, part="screen"):
    try:
        return data["pricing_table"][brand][model][part]
    except (KeyError, TypeError):
        return "Contact for quote"

# Core logical function to get dynamic context based on user message and config data
def get_dynamic_context(user_msg, config_data):
    # user input message preprocessing
    user_msg_lower = user_msg.lower()# Change user input message to lowercase for easier matching
    clean_msg = user_msg_lower.replace(" ", "")# Preprocessing: Remove spaces for matching
    
    # Store information
    stores = config_data.get("stores", []) # Get store info from config, default to empty list if not found
    store_list = []
    for s in stores:
        # use .get() to get values with defaults to avoid KeyErrors
        name = s.get("name", "G-Fix Solution")
        address = s.get("address", "Contact us")
        hours = s.get("time") or "9am - 6pm"
        url = s.get("url") or "#"
        # 将每个门店格式化为一段带图标的加粗文本
        # 注意：这里故意不用表格，是为了防止移动端显示错位
        info = f"📍 **{name}**\n   Address: {address}\n   Hours: {hours}\n   Link: {url}"
        store_list.append(info)
    # Separated by two newline characters
    formatted_stores = "\n\n".join(store_list)
    # inieially context only contains store info and currency, RAG and pricing will be added if relevant
    context_parts = ["Store Locations:\n" + formatted_stores, "Currency: NZD"]

    # RAG faiss detect and search
    if faq_index is not None: # if index loaded successfully
        try:
            # transform user message into vector using the same model used for indexing
            query_embedding = rag_model.encode([user_msg])
            # Search the vector library for the most similar k=2 (2 records) records.
            D, I = faq_index.search(np.array(query_embedding).astype('float32'), k=2)
            # Extract the specific text content from the metadata based on index number I[0].
            retrieved_docs = [faq_metadata[i]['content'] for i in I[0] if i != -1 and i < len(faq_metadata)]
            if retrieved_docs:
                ###很重要 考虑一下 if find the relevant policies will be added to the background information.
                context_parts.append("Relevant Policy & Service Info:\n" + "\n---\n".join(retrieved_docs))
        except Exception as e:
            print(f"⚠️ RAG search error: {e}")

    # Pricing table
    price_keywords = ["price", "iphone", "samsung", "screen", "battery", "价格", "多少钱", "cost"]
    if any(k in user_msg_lower for k in price_keywords):
        pricing = config_data.get("pricing_table", {}) #Get Price List
        price_text = "### OFFICIAL REAL-TIME PRICING (PRIORITY):\n"
        found_any = False
        # for loop through the pricing data to find matches based on brand and model.
        for brand, models in pricing.items():
            if isinstance(models, dict):
                # for loop through each model under the brand to find matches based on user message
                for model_name, details in models.items():
                    # Preprocessing: Remove spaces and lowercase for matching
                    clean_model = model_name.lower().replace(" ", "")
                    # if user message contains the model name, we consider it a match and add the price info to the context.
                    if clean_model in clean_msg:
                        screen = details.get("screen", "N/A")
                        battery = details.get("battery", "N/A")
                        camera = details.get("camera", "N/A")
                        # Format the price info as bullet points with bold text for model name and prices, and add to the price_text string.
                        price_text += f"- {model_name}: Screen ${screen}, Battery ${battery}, Camera ${camera}\n"
                        found_any = True
        if found_any:
            # Price information will only be added if a specific model is matched.
            context_parts.append(price_text)
    # Finally, we join all the context parts with two newline characters and return as a single string to be included in the system prompt for the AI model.
    return "\n\n".join(context_parts)

# router for chat endpoint
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    # Processing pre-screening request
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    ###Secutity Guard:
    try:
        data = request.get_json(silent=True) or {} # Safely get JSON data, default to empty dict if parsing fails
        raw_msg = data.get("message", "") # Extract the raw text input by the user
        # call security function( until/security.py))
        user_message, error = validate_and_clean(raw_msg) # Validate and clean the input message, get back the cleaned message and any error message
        # If there is an error (e.g. input is empty, too long, contains HTML/SQL injection patterns, etc.) to protect against token waste
        if error:
            return jsonify({
            "reply": error, 
            "show_repair_card": False,
            "status": "security_blocked"
        })

        # Core logic of RAG
        # get_dynamic_context function will generate the context based on user message 
        # then use to FAISS to search the relevant data
        local_context = get_dynamic_context(user_message, business_config)

        # Call Groq API to get the AI response.
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system", # System prompt with dynamic context included, instructing the model to prioritize the provided information and follow specific response rules.
                    "content": (
                        "You are a professional repair assistant for G-Fix Solution. "
                        "1. PRICE DATA: ONLY use numbers from '### OFFICIAL REAL-TIME PRICING'. "
                        "2. LANGUAGE RULE: Respond in the SAME language as the user. "
                        "3. NO TABLES: Use bullet points (-) only. No Markdown tables! "
                        f"\n\nRetrieved Manual Context:\n{local_context}"
                    )
                },
                {"role": "user", "content": user_message}
            ],
            temperature=0.7
        )
        # Extracting what the AI ​​says
        reply = completion.choices[0].message.content
        
        # Determine whether to display the order repair card.
        query_keywords = ["query", "status", "order", "查询", "状态", "订单", "进度"]
        show_card = any(k in user_message.lower() for k in query_keywords)
        # The results are packaged into JSON format and sent back to the front end.
        return jsonify({"reply": reply, "show_repair_card": show_card})

    except Exception as e:
        print(f"❌ Chat Error: {e}")
        return jsonify({"reply": "System busy, please try later.", "show_repair_card": False})

if __name__ == '__main__':
    print("开启后端...")
    app.run(debug=True, port=5000, host='0.0.0.0')
    