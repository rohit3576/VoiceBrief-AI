from transformers import pipeline
from services.knowledge_store import search_knowledge

# -----------------------------
# LOAD LIGHTWEIGHT QA MODEL
# -----------------------------
qa_pipeline = pipeline(
    "question-answering",
    model="deepset/roberta-base-squad2"
)

# -----------------------------
# ANSWER QUESTION USING RAG
# -----------------------------
def answer_question(question):
    """
    Extractive QA using FAISS-retrieved context.
    Very stable and accurate on CPU.
    """

    context_chunks = search_knowledge(question, top_k=3)

    if not context_chunks:
        return "I don't have enough information to answer that."

    # Merge chunks into one context
    context = " ".join(context_chunks)

    result = qa_pipeline(
        question=question,
        context=context
    )

    # If model says no answer
    if result["score"] < 0.2:
        return "I don't know."

    return result["answer"]
