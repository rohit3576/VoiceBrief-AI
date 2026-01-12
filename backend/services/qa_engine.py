from transformers import pipeline
from services.knowledge_store import search_knowledge

# -----------------------------
# LOAD OPEN-SOURCE LLM (PHI-2)
# -----------------------------
qa_pipeline = pipeline(
    "text-generation",
    model="microsoft/phi-2",
    max_new_tokens=128,
    do_sample=False
)

# -----------------------------
# ANSWER QUESTION USING RAG
# -----------------------------
def answer_question(question):
    """
    Answers a question using FAISS-retrieved context and Phi-2.
    """

    # 1️⃣ Retrieve relevant knowledge chunks
    context_chunks = search_knowledge(question, top_k=3)

    if not context_chunks:
        return "I don't have enough information to answer that."

    # 2️⃣ Build strong instruction prompt
    context = "\n".join(context_chunks)

    prompt = f"""
You are an AI assistant.
Answer the question strictly using the context below.
Give a complete, factual answer.
If the answer is not present, say "I don't know".

Context:
{context}

Question:
{question}

Answer:
"""

    # 3️⃣ Generate answer
    response = qa_pipeline(prompt)

    # 4️⃣ Clean output (Phi-2 echoes prompt)
    answer = response[0]["generated_text"].replace(prompt, "").strip()

    return answer
