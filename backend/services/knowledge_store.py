import faiss
import os
import pickle
from sentence_transformers import SentenceTransformer

# -----------------------------
# CONFIG
# -----------------------------
VECTOR_DIM = 384  # all-MiniLM-L6-v2 output size
INDEX_FILE = "backend/knowledge.index"
DATA_FILE = "backend/knowledge.pkl"

# -----------------------------
# LOAD EMBEDDING MODEL
# -----------------------------
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------------
# LOAD OR CREATE FAISS INDEX
# -----------------------------
if os.path.exists(INDEX_FILE) and os.path.exists(DATA_FILE):
    index = faiss.read_index(INDEX_FILE)
    with open(DATA_FILE, "rb") as f:
        documents = pickle.load(f)
else:
    index = faiss.IndexFlatL2(VECTOR_DIM)
    documents = []  # stores original text chunks

# -----------------------------
# UTILS
# -----------------------------
def split_text(text, chunk_size=300):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

# -----------------------------
# ADD TO KNOWLEDGE BASE
# -----------------------------
def add_to_knowledge_base(text):
    global index, documents

    chunks = split_text(text)
    embeddings = embedder.encode(chunks)

    index.add(embeddings)
    documents.extend(chunks)

    # Persist to disk
    faiss.write_index(index, INDEX_FILE)
    with open(DATA_FILE, "wb") as f:
        pickle.dump(documents, f)

# -----------------------------
# SEARCH KNOWLEDGE BASE
# -----------------------------
def search_knowledge(query, top_k=3):
    query_embedding = embedder.encode([query])
    distances, indices = index.search(query_embedding, top_k)

    results = []
    for idx in indices[0]:
        if idx < len(documents):
            results.append(documents[idx])

    return results
