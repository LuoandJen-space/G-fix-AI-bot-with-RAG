from flask import Flask, request, jsonify
from flask_cors import CORS #fondend and backend connection
from groq import Groq 
from dotenv import load_dotenv 
import os
import json 

# make sure the file path is correct
basedir = os.path.abspath(os.path.dirname(__file__))
# Concatenate the full path of the .env file
env_path = os.path.join(basedir, '.env')
# load environment variables from the .env file (API key read and save)
load_dotenv(env_path)

# read the API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found. Please check your .env file.")
#initialize the Groq client and flask app
client = Groq(api_key=GROQ_API_KEY)
app = Flask(__name__)
# open CORS for all routes(eg. cookies)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

data_dir = os.path.join(basedir, "data") #locate the data directory
business_config = {} #initialize the business configuration
faq_en = ""
faq_zh = ""
try:
    # read config.json content
    with open(os.path.join(data_dir, "config.json"), "r", encoding="utf-8") as f:
        business_config = json.load(f)
    with open(os.path.join(data_dir, "faq_en.md"), "r", encoding="utf-8") as f:
        faq_en = f.read()
    with open(os.path.join(data_dir, "faq_zh.md"), "r", encoding="utf-8") as f:
        faq_zh = f.read()
    print("✅ Business data loaded successfully")
except Exception as e:
    print(f"⚠️ Error loading data: {e}")

#route call
@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "Flask Server is Running"})
#优化 Context的生成逻辑：根据用户消息的内容动态决定什么时候将价格表orFAQ加入到Context中，
#避免每次都发送大量信息给模型，提升效率和响应速度。
def get_dynamic_context(user_msg, config_data, faq_en_text, faq_zh_text):
    user_msg_lower = user_msg.lower()

    # core business info
    core_info = {
        "shop": "G-Fix Solution",
        "locations_and_hours": config_data.get("stores", []),
        "currency": "NZD" # lock currency to NZD
    }
    context_parts = [f"Core Business Info: {json.dumps(core_info, ensure_ascii=False)}"]
    is_chinese = any('\u4e00' <= char <= '\u9fff' for char in user_msg)

    # priceing table trigger words
    price_trigger = ["price", "cost", "how much", "screen", "battery", "iphone", "价格", "多少钱", "屏幕", "电池"]
    if any(k in user_msg_lower for k in price_trigger):
        pricing = config_data.get("pricing_table", {})
        context_parts.append(f"Price List (NZD): {json.dumps(pricing, ensure_ascii=False)}")

    # policy and warranty trigger words
    policy_trigger = ["warranty", "terms", "service", "policy", "保修", "条款", "保障", "售后"]
    if any(k in user_msg_lower for k in policy_trigger):
        selected_faq = faq_zh_text if is_chinese else faq_en_text
        context_parts.append(f"Warranty & Policy Details:\n{selected_faq}")

    return "\n\n".join(context_parts)
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS": #Pre-screening request
        return "", 200
    print("📡 Receive connection request")
    try:
        data = request.json
        user_message = data.get("message")
        if not user_message:
            return jsonify({"reply": "Please input message"})
        local_context = get_dynamic_context(user_message, business_config, faq_en, faq_zh)

        # Calling openai/gpt-oss-120b models
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b", 
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "You are a professional phone repair assistant. "
                        "Use the provided business config and FAQ to answer customer questions accurately. "
                        "IMPORTANT RULES: 1. Do not use Markdown tables in your response. "
                        "Use bullet points or clear paragraphs for better readability on mobile devices. "
                        "If you don't know the answer, ask the customer to provide their contact details. "
                        f"\n\nContext:\n{local_context}"
                    )
                },
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=1024,# Reply length limit 
            stream=False
        )
        # Get the AI's response text
        reply = completion.choices[0].message.content
        
        # repair card logical
        query_keywords = ["query", "status", "order", "查询", "状态", "订单", "进度"]
        # when the keyword is in the message will call the repair card shown on the html
        show_card = any(k in user_message.lower() for k in query_keywords)
       
        #reply the JSON to fontend
        return jsonify({
            "reply": reply,
            "show_repair_card": show_card
        })
    except Exception as e:
        print(f"❌ Groq API Error: {e}")
        return jsonify({"reply": f"Sorry, the system cannot respond: {str(e)}", "show_repair_card": False})

if __name__ == '__main__':
    print("🚀 Backend services are starting up...")
    app.run(debug=True, port=5000, host='0.0.0.0')