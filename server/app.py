from flask import Flask, request, jsonify, render_template

from flask_cors import CORS

from groq import Groq

from dotenv import load_dotenv

import os



# -----------------------------

# 1️⃣ 读取 .env 文件 (增强版)

# -----------------------------

# 这一步是为了防止 .venv 环境下找不到同目录的文件

basedir = os.path.abspath(os.path.dirname(__file__))

env_path = os.path.join(basedir, '.env')

load_dotenv(env_path)



GROQ_API_KEY = os.getenv("GROQ_API_KEY")



# 调试信息：让我们在终端一眼看到结果

print(f"--- 环境检查 ---")

print(f"正在尝试读取: {env_path}")

print(f"API Key 是否获取成功: {'✅ Yes' if GROQ_API_KEY else '❌ No'}")

print(f"----------------")



if not GROQ_API_KEY:

    raise ValueError("❌ GROQ_API_KEY not found. Please check your .env file.")

# -----------------------------

# 2️⃣ 初始化 Groq client

# -----------------------------

client = Groq(api_key=GROQ_API_KEY)



# -----------------------------

# 3️⃣ Flask app

# -----------------------------

app = Flask(__name__)

# 允许所有来源，并允许所有 Header

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)





# -----------------------------

# 4️⃣ 读取 FAQ

# -----------------------------

try:

    with open("faq.txt", "r", encoding="utf-8") as f:

        faq_data = f.read()

except FileNotFoundError:

    faq_data = "No FAQ data available."



# -----------------------------

# 5️⃣ 首页

# -----------------------------

@app.route("/", methods=["GET"])

def index():

    return jsonify({"status": "Flask Server is Running"})

# -----------------------------

# -----------------------------

# 6️⃣ 聊天 API (修改版)

# -----------------------------

@app.route("/chat", methods=["POST", "OPTIONS"])

def chat():



    if request.method == "OPTIONS":

        return "", 200

    print("📡 [收到请求] 有人敲门了！")

    try:

        data = request.json

        user_message = data.get("message")



        if not user_message:

            return jsonify({"reply": "Please enter a message."})



        completion = client.chat.completions.create(

            model="openai/gpt-oss-120b",

            messages=[

                {"role": "system", "content": f"You are a professional phone repair assistant. Business context: {faq_data}"},

                {"role": "user", "content": user_message}

            ],

            temperature=0.7,

            max_tokens=1024,

            stream=False

        )



        reply = completion.choices[0].message.content



        # --- 数据驱动逻辑开始 ---

        # 1. 定义哪些关键词会触发显示维修卡片

        trigger_keywords = ["维修单", "进度", "查询", "单号", "status", "order"]

       

        # 2. 检查 AI 的回复里是否包含这些词

        show_card = any(keyword in reply.lower() for keyword in trigger_keywords)

       

        # 3. 构造返回给前端的结构化 JSON

        return jsonify({

            "reply": reply,

            "show_repair_card": show_card  # 这里就是前端 App.tsx 认的那个字段！

        })

        # --- 数据驱动逻辑结束 ---



    except Exception as e:

        print(f"Groq API Error: {e}")

        return jsonify({"reply": f"Error: {str(e)}", "show_repair_card": False})

# -----------------------------

# 7️⃣ 启动服务器

# -----------------------------

if __name__ == '__main__':

    print("🚀 后端正在启动...") # 加这一行用来测试

    app.run(debug=True, port=5000, host='127.0.0.1')