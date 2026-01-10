from transformers import pipeline
from services.knowledge_store import search_knowledge

# -----------------------------
# LOAD OPEN-SOURCE LLM
# -----------------------------
qa_pipeline = pipeline(
    "text2text-generation",
    model="google/flan-t5-base"
)

# -----------------------------
# ANSWER QUESTION USING MEMORY
# -----------------------------
def answer_question(question):
    """
    Answers a question using FAISS-retrieved context.
    """

    # 1️⃣ Retrieve relevant knowledge chunks
    context_chunks = search_knowledge(question, top_k=3)

    if not context_chunks:
        return "I don't have enough information to answer that yet."

    # 2️⃣ Build context prompt
    context = "\n".join(context_chunks)

    prompt = f"""
You are an AI assistant.
Answer the question ONLY using the context below.
If the answer is not in the context, say you don't know.

Context:
{context}

Question:
{question}

Answer:
"""

    # 3️⃣ Generate answer
    response = qa_pipeline(
        prompt,
        max_length=200,
        do_sample=False
    )

    return response[0]["generated_text"].strip()
