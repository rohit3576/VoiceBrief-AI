from transformers import pipeline

# Load summarization model once (IMPORTANT)
summarizer = pipeline(
    "summarization",
    model="facebook/bart-large-cnn"
)

def summarize_text(text):
    """
    Generate a concise summary from input text.
    """
    if len(text.strip()) < 50:
        return "Text too short to summarize."

    summary = summarizer(
        text,
        max_length=120,
        min_length=40,
        do_sample=False
    )

    return summary[0]["summary_text"]
