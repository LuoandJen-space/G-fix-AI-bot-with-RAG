import os
import faiss
import numpy as np
import json
from sentence_transformers import SentenceTransformer

# get the absolute path of the current file (ingest.py) and then navigate to the data directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# splicing paths for orginal text chunks
CHUNKS_DIR = os.path.join(BASE_DIR, "data", "chunks")
# splice paths of vector database file
INDEX_PATH = os.path.join(BASE_DIR, "data", "faq_index.faiss")
# splice paths of the corresponding text description file
METADATA_PATH = os.path.join(BASE_DIR, "data", "faq_metadata.json")
print("Loading AI model, please wait")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2') #50 languages

# read text chunks, convert to vectors, and build FAISS index
def build_index():
    # 2. read text chunks
    print(f"read {CHUNKS_DIR} for text chunks...")
    if not os.path.exists(CHUNKS_DIR):
        print(f"❌ Error: Folder not found {CHUNKS_DIR}")
        print("Please confirm that the server/data/chunks folder exists and contains .txt files")
        return
    documents = []
    metadata = []
    # Iterate through the .txt files in the chunks directory
    for filename in sorted(os.listdir(CHUNKS_DIR)):
        if filename.endswith(".txt"):
            path = os.path.join(CHUNKS_DIR, filename)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read().strip() # read the content of the text file
                if content:
                    documents.append(content)
                    metadata.append({
                        "filename": filename,
                        "content": content
                    })
    if not documents:
        print("❌ No text chunks found in the directory. Please add .txt files to the server/data/chunks folder.")
        return

    # Vectorization
    print(f"Converting {len(documents)} text chunks to vectors...")
    embeddings = model.encode(documents, show_progress_bar=True)
    # add faiss index
    dimension = embeddings.shape[1]
    # L2 Euclidean distance
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings).astype('float32'))
    # save the index and metadata
    faiss.write_index(index, INDEX_PATH)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print("\n✅ Index built successfully!")
    print(f"- Vector database saved: {INDEX_PATH}")
    print(f"- Text metadata saved: {METADATA_PATH}")

if __name__ == "__main__":
    build_index()