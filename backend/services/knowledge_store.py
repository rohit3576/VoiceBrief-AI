import faiss
import os
import pickle
import re
from sentence_transformers import SentenceTransformer

# -----------------------------
# CONFIG
# -----------------------------
VECTOR_DIM = 384  # all-MiniLM-L6-v2 embedding size
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
    documents = []

# -----------------------------
# IMPROVED CHUNKING (SENTENCE + OVERLAP)
# -----------------------------
def split_text(text, max_chars=500, overlap=100):
    """
    Split text into sentence-aware, overlapping chunks.
    This preserves semantic meaning and improves retrieval accuracy.
    """
    # Split into sentences using regex
    sentences = re.split(r'(?<=[.!?])\s+', text)

    chunks = []
    current_chunk = ""

    for sentence in sentences:
        # If sentence fits in current chunk
        if len(current_chunk) + len(sentence) <= max_chars:
            current_chunk += " " + sentence
        else:
            # Save current chunk
            chunks.append(current_chunk.strip())

            # Start new chunk with overlap
            current_chunk = current_chunk[-overlap:] + " " + sentence

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks

# -----------------------------
# ADD TO KNOWLEDGE BASE
# -----------------------------
def add_to_knowledge_base(text):
    """
    Splits text, embeds chunks, and stores them in FAISS.
    """
    global index, documents

    chunks = split_text(text)

    if not chunks:
        return

    embeddings = embedder.encode(chunks)

    index.add(embeddings)
    documents.extend(chunks)

    # Persist index and documents
    faiss.write_index(index, INDEX_FILE)
    with open(DATA_FILE, "wb") as f:
        pickle.dump(documents, f)

# -----------------------------
# SEARCH KNOWLEDGE BASE
# -----------------------------
def search_knowledge(query, top_k=3):
    """
    Searches FAISS index and returns top matching text chunks.
    """
    if index.ntotal == 0:
        return []

    query_embedding = embedder.encode([query])
    distances, indices = index.search(query_embedding, top_k)

    results = []
    for idx in indices[0]:
        if 0 <= idx < len(documents):
            results.append(documents[idx])

    return results
