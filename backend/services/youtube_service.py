import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
import logging

logger = logging.getLogger(__name__)

class YouTubeService:
    @staticmethod
    def extract_video_id(url):
        """Extract YouTube video ID from various URL formats"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=)([\w-]+)',
            r'(?:youtu\.be\/)([\w-]+)',
            r'(?:youtube\.com\/embed\/)([\w-]+)',
            r'(?:youtube\.com\/v\/)([\w-]+)',
            r'(?:youtube\.com\/shorts\/)([\w-]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    @staticmethod
    def get_transcript(video_id, languages=['en']):
        """Fetch transcript for a YouTube video"""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get manual transcript first
            try:
                transcript = transcript_list.find_manually_created_transcript(languages)
            except:
                # Fall back to auto-generated
                transcript = transcript_list.find_generated_transcript(languages)
            
            # Fetch the actual transcript
            transcript_data = transcript.fetch()
            
            # Combine all text
            full_text = ' '.join([item['text'] for item in transcript_data])
            
            # Get video metadata
            video_info = YouTubeService.get_video_info(video_id)
            
            return {
                'success': True,
                'transcript': full_text,
                'video_id': video_id,
                'title': video_info.get('title', 'Unknown'),
                'duration': video_info.get('duration', 0),
                'language': transcript.language_code
            }
            
        except TranscriptsDisabled:
            return {'success': False, 'error': 'Transcripts are disabled for this video'}
        except NoTranscriptFound:
            return {'success': False, 'error': 'No English transcript found for this video'}
        except Exception as e:
            logger.error(f"Error fetching transcript: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def get_video_info(video_id):
        """Get video metadata using pytube"""
        try:
            from pytube import YouTube
            yt = YouTube(f'https://youtube.com/watch?v={video_id}')
            return {
                'title': yt.title,
                'duration': yt.length,
                'author': yt.author,
                'views': yt.views
            }
        except:
            return {}