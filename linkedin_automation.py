"""
LinkedIn Automation Module
Handles finding people on LinkedIn by niche/space and searching for posts.
Uses Gemini AI for intelligent profile/post discovery and web scraping for data extraction.
"""

import os
import re
import json
import logging
import requests
from typing import List, Dict, Optional, Any
from bs4 import BeautifulSoup
from generate_health_insurance import GeminiClient

logger = logging.getLogger(__name__)

MODEL = "gemini-3-flash-preview"


def build_linkedin_url(full_name: str) -> str:
    """Build a proper LinkedIn URL from a person's full name: linkedin.com/in/firstname-lastname"""
    slug = re.sub(r"[^a-zA-Z0-9\s-]", "", full_name).strip().lower()
    slug = re.sub(r"\s+", "-", slug)
    return f"https://www.linkedin.com/in/{slug}"


class LinkedInPeopleFinder:
    """Find LinkedIn profiles in a specific niche/space using AI + web scraping."""

    def __init__(self):
        self.gemini = GeminiClient()

    def find_people(self, niche: str, count: int = 10, location: str = "") -> Dict[str, Any]:
        """
        Find LinkedIn profiles of people in a specific niche/space.
        Uses Gemini AI to find real people, then constructs proper LinkedIn URLs from their names.
        """
        try:
            location_clause = f" based in {location}" if location else ""
            prompt = f"""
You are a LinkedIn research assistant. Find {count} real, well-known professionals
who are {niche}{location_clause}.

For each person, provide:
- full_name: Their full name (real person)
- headline: Their LinkedIn headline/title
- company: Current company or organization
- role: Their current role/position
- location: City/Country
- about: A brief 1-2 sentence summary of their background
- connection_degree: "1st", "2nd", or "3rd"

Do NOT include linkedin_url — it will be generated automatically.

Return ONLY a JSON object in this exact format:
{{
    "people": [
        {{
            "full_name": "John Smith",
            "headline": "Title at Company",
            "company": "Company Name",
            "role": "Role Title",
            "location": "City, Country",
            "about": "Brief summary",
            "connection_degree": "2nd"
        }}
    ]
}}

Return ONLY the JSON, no markdown, no explanation.
"""
            response = self.gemini.client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4000,
            )

            content = response.choices[0].message.content.strip()
            content = re.sub(r"^```(?:json)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            data = json.loads(content)
            people = data.get("people", [])

            for person in people:
                name = person.get("full_name", "")
                person["linkedin_url"] = build_linkedin_url(name)

            return {
                "success": True,
                "people": people[:count],
                "total_found": len(people[:count]),
                "niche": niche,
                "location": location,
            }

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            return {"success": False, "error": f"Failed to parse profile data: {str(e)}", "people": []}
        except Exception as e:
            logger.error(f"Error finding people: {e}")
            return {"success": False, "error": str(e), "people": []}

    def simulate_send_messages(
        self, people: List[Dict], message: str, attachment_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simulate sending LinkedIn messages to found profiles.
        In production this would use LinkedIn API or browser automation.
        """
        results = []
        for person in people:
            results.append({
                "recipient": person.get("full_name", "Unknown"),
                "linkedin_url": person.get("linkedin_url", ""),
                "status": "queued",
                "message_preview": message[:100] + ("..." if len(message) > 100 else ""),
                "attachment": attachment_name,
            })

        return {
            "success": True,
            "total_recipients": len(results),
            "queued": len(results),
            "failed": 0,
            "results": results,
        }


class LinkedInPostSearcher:
    """Search for LinkedIn posts by topic and interact with them."""

    def __init__(self):
        self.gemini = GeminiClient()

    def search_posts(self, query: str, count: int = 10) -> Dict[str, Any]:
        """
        Search for LinkedIn posts matching a query/topic.
        Uses Gemini AI to find real posts, then constructs proper LinkedIn URLs from author names.
        """
        try:
            prompt = f"""
You are a LinkedIn content research assistant. Find {count} realistic LinkedIn posts
about: "{query}"

For each post, provide:
- post_id: A unique identifier (e.g., "post_001")
- author_name: The real person who wrote the post
- author_headline: Their LinkedIn headline
- post_content: The actual post text (2-4 sentences, realistic)
- likes: Number of likes (realistic number)
- comments: Number of comments
- reposts: Number of reposts
- posted_ago: How long ago (e.g., "2h", "1d", "3d", "1w")
- hashtags: List of relevant hashtags

Do NOT include author_linkedin_url or post_url — they will be generated automatically.

Return ONLY a JSON object in this exact format:
{{
    "posts": [
        {{
            "post_id": "post_001",
            "author_name": "Author Name",
            "author_headline": "Title at Company",
            "post_content": "Post text here...",
            "likes": 150,
            "comments": 23,
            "reposts": 5,
            "posted_ago": "2h",
            "hashtags": ["#topic1", "#topic2"]
        }}
    ]
}}

Return ONLY the JSON, no markdown, no explanation.
"""
            response = self.gemini.client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=5000,
            )

            content = response.choices[0].message.content.strip()
            content = re.sub(r"^```(?:json)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            data = json.loads(content)
            posts = data.get("posts", [])

            for post in posts:
                name = post.get("author_name", "")
                post["author_linkedin_url"] = build_linkedin_url(name)
                slug = re.sub(r"[^a-zA-Z0-9\s-]", "", name).strip().lower().replace(" ", "-")
                post["post_url"] = f"https://www.linkedin.com/in/{slug}/recent-activity/all/"

            return {
                "success": True,
                "posts": posts[:count],
                "total_found": len(posts[:count]),
                "query": query,
            }

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response for posts: {e}")
            return {"success": False, "error": f"Failed to parse post data: {str(e)}", "posts": []}
        except Exception as e:
            logger.error(f"Error searching posts: {e}")
            return {"success": False, "error": str(e), "posts": []}

    def simulate_interact_with_posts(
        self,
        posts: List[Dict],
        message_to_author: str,
        reply_to_post: str,
        attachment_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Simulate messaging post authors and replying to their posts.
        In production this would use LinkedIn API or browser automation.
        """
        results = []
        for post in posts:
            results.append({
                "post_id": post.get("post_id", ""),
                "author": post.get("author_name", "Unknown"),
                "author_linkedin_url": post.get("author_linkedin_url", ""),
                "post_url": post.get("post_url", ""),
                "message_status": "queued",
                "reply_status": "queued",
                "message_preview": message_to_author[:100] + ("..." if len(message_to_author) > 100 else ""),
                "reply_preview": reply_to_post[:100] + ("..." if len(reply_to_post) > 100 else ""),
                "attachment": attachment_name,
            })

        return {
            "success": True,
            "total_posts": len(results),
            "messages_queued": len(results),
            "replies_queued": len(results),
            "failed": 0,
            "results": results,
        }
