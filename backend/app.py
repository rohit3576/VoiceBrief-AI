# backend/services/summarizer.py
from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

class Summarizer:
    def __init__(self):
        logger.info("Loading summarization model...")
        self.summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=-1  # CPU
        )
        logger.info("Summarization model loaded successfully")
    
    def summarize(self, text, max_length=150, min_length=30):
        """Generate summary from text"""
        try:
            if not text or len(text.split()) < 20:
                return "Text too short for summarization"
            
            # Adjust max_length based on input length
            input_length = len(text.split())
            max_len = min(max_length, input_length // 2)
            min_len = min(min_length, max_len // 2)
            
            summary = self.summarizer(
                text[:1024],  # Limit input size
                max_length=max_len,
                min_length=min_len,
                do_sample=False
            )
            return summary[0]['summary_text']
        except Exception as e:
            logger.error(f"Summarization error: {str(e)}")
            return f"Error generating summary: {str(e)}"
    
    def extract_key_points(self, text, num_points=5):
        """Extract key points from text"""
        try:
            # Simple sentence tokenization
            sentences = text.split('. ')
            
            # Score sentences by length and position
            scored_sentences = []
            for i, sentence in enumerate(sentences):
                if len(sentence.split()) > 5:  # Filter very short sentences
                    # Give higher score to sentences at beginning
                    position_score = 1.0
                    if i < len(sentences) * 0.2:  # First 20%
                        position_score = 1.5
                    
                    # Length score (prefer medium-length sentences)
                    word_count = len(sentence.split())
                    if 8 <= word_count <= 25:
                        length_score = 1.2
                    else:
                        length_score = 0.8
                    
                    total_score = position_score * length_score
                    scored_sentences.append((sentence, total_score))
            
            # Sort by score and get top points
            scored_sentences.sort(key=lambda x: x[1], reverse=True)
            key_points = [s[0] for s in scored_sentences[:num_points]]
            
            return key_points
        except Exception as e:
            logger.error(f"Key points extraction error: {str(e)}")
            return []
    
    def answer_question(self, context, question):
        """Simple QA by finding relevant sentences"""
        try:
            # Convert to lowercase for matching
            context_lower = context.lower()
            question_lower = question.lower()
            
            # Split into sentences
            sentences = context.split('. ')
            
            # Find sentences containing question keywords
            keywords = set(question_lower.split())
            relevant_sentences = []
            
            for sentence in sentences:
                sentence_lower = sentence.lower()
                # Count how many keywords are in this sentence
                matches = sum(1 for word in keywords if word in sentence_lower and len(word) > 3)
                if matches >= 1:  # At least 1 keyword matches
                    relevant_sentences.append((sentence, matches))
            
            # Sort by relevance
            relevant_sentences.sort(key=lambda x: x[1], reverse=True)
            
            if relevant_sentences:
                # Return top 2 most relevant sentences
                answer = '. '.join([s[0] for s in relevant_sentences[:2]])
                return answer
            else:
                return "I couldn't find a specific answer to your question in the content."
                
        except Exception as e:
            logger.error(f"Question answering error: {str(e)}")
            return f"Error processing question: {str(e)}"