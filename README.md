# Project structure
Ai-b-chatbot
This project is written for the electronic products repair shop to help to reduce the labour cost. Save the labour time for efficiency improvement.

### Backend configuration(Server)
   #### 1.1 into the server
       cd server
   #### 1.2 Creating a virtual environment
       python -m venv .venv
       source .venv/bin/activate
   #### 1.3 Install dependencies
       pip install -r requirements.txt
   #### 1.4 Configure environment variables
       GROQ_API_KEY=Your_GROQ_KEY
       FLASK_ENV=development
   #### 1.5 Bot back end
       python app.py

### Frontend configuration(Client)
   #### 2.1 into the client
       cd client
   #### 2.2 Install dependencies
       npm install
   #### 2.3 Bot front end
       npm run dev

### Test running
   #### 3.1 Running the test under the server/
   python -m pytest tests/ --html=full_report.html --self-contained-html -p no:logging

## Technology stack:
Back: Python, Flask, FAISS, Bleach(HTML Clean)
Front: React, TypeScipt, Vite, Tailwind CSS
Test: Pytest, Pytest-HTML

If you discover new security vulnerabilities or have better suggestions for RAG optimization, please submit a Pull Request!

   
   
