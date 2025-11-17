import os
import json
import time
import logging
from openai import OpenAI, APIError, APIConnectionError, RateLimitError
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        # Gemini's OpenAI-compatible endpoint
        base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
        
        self.client = OpenAI(
            api_key=os.getenv('GEMINI_API_KEY'),
            base_url=base_url
        )
    
    def generate_companies(self, industry, number, country, max_retries=5, initial_delay=2):
        """
        Generate companies with automatic retry logic for 503 errors.
        
        Args:
            industry: Industry to target
            number: Number of companies to generate
            country: Country to focus on
            max_retries: Maximum number of retry attempts (default: 5)
            initial_delay: Initial delay in seconds before first retry (default: 2)
        
        Returns:
            JSON response with companies data
        
        Raises:
            Exception: If all retries are exhausted
        """
        prompt = f"""
        You are a professional lead generation expert. Generate a comprehensive list of {number} companies in the {industry} industry that are based in or operate in {country}.
        
        **IMPORTANT: You must return your response as a valid JSON object only. Do not include any markdown formatting, code blocks, or additional text outside the JSON.**
        
        Return a JSON object with this structure:
        {{
            "companies": [
                {{
                    "company_name": "Official company name",
                    "website_url": "Official website link",
                    "company_size": "Number of employees (approximate range)",
                    "headquarters_location": "City and Country",
                    "revenue_market_cap": "Annual revenue or market capitalization",
                    "key_products_services": "Main offerings relevant to the industry",
                    "target_market": "Primary customer segments they serve",
                    "number_of_users": "Total number of users/members/customers/subscribers",
                    "notable_customers": ["Customer 1", "Customer 2", "Customer 3"] or null,
                    "social_media": {{
                        "linkedin": "LinkedIn company page URL",
                        "twitter": "Twitter/X profile URL",
                        "facebook": "Facebook page URL",
                        "instagram": "Instagram profile URL",
                        "youtube": "YouTube channel URL"
                    }},
                    "contact_email": "General contact email",
                    "recent_news_insights": "Recent developments, partnerships, or notable information",
                    "decision_maker_roles": ["CEO", "CFO", "VP of Sales", "etc."]
                }}
            ]
        }}
        
        Focus on providing accurate, up-to-date information that would be valuable for business development and lead generation purposes.
        
        **CRITICAL: If any information is not publicly available or cannot be found, set that field to null (not the string "Not publicly available", but the JSON null value).**
        
        For "number_of_users", include the total number of users, members, customers, or subscribers the company serves. Use the most recent publicly available data with approximate numbers if exact figures aren't available (e.g., "50 million members", "2.5 million customers"). If not available, set to null.
        
        For "notable_customers", include a list of known clients, customers, or partners if publicly available. If not available, set to null.
        
        For "social_media", provide the official URLs for each platform (LinkedIn, Twitter/X, Facebook, Instagram, YouTube). Set individual platforms to null if not found. Include the full URL for each platform.
        
        Remember: Return ONLY the JSON object, no additional text or formatting.
        """
        
        last_exception = None
        
        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
                    model="gemini-2.5-flash",
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                )
                
                # Success - break out of retry loop
                break
                
            except Exception as e:
                last_exception = e
                error_str = str(e).lower()
                
                # Try to extract status code from various exception attributes
                error_code = None
                if hasattr(e, 'status_code'):
                    error_code = e.status_code
                elif hasattr(e, 'response') and hasattr(e.response, 'status_code'):
                    error_code = e.response.status_code
                elif hasattr(e, 'code'):
                    error_code = e.code
                
                # Check if it's a 503 or overload error
                is_503_error = (
                    error_code == 503 or
                    '503' in str(e) or
                    'overloaded' in error_str or
                    'unavailable' in error_str or
                    'service unavailable' in error_str or
                    'model is overloaded' in error_str
                )
                
                # Check if it's a rate limit error (429)
                try:
                    is_rate_limit_type = isinstance(e, RateLimitError)
                except (NameError, TypeError):
                    is_rate_limit_type = False
                
                is_rate_limit = (
                    error_code == 429 or
                    is_rate_limit_type or
                    'rate limit' in error_str or
                    'too many requests' in error_str
                )
                
                # Check if it's a connection error
                try:
                    is_connection_error_type = isinstance(e, APIConnectionError)
                except (NameError, TypeError):
                    is_connection_error_type = False
                
                is_connection_error = (
                    is_connection_error_type or
                    'connection' in error_str or
                    'timeout' in error_str or
                    'network' in error_str
                )
                
                # Only retry on 503, 429, or connection errors
                if not (is_503_error or is_rate_limit or is_connection_error):
                    # Don't retry on other errors
                    logger.error(f"Non-retryable error: {e}")
                    raise Exception(f"Error code: {error_code or 'UNKNOWN'} - {str(e)}")
                
                # If this is the last attempt, raise the exception
                if attempt == max_retries - 1:
                    logger.error(f"All {max_retries} retry attempts exhausted. Last error: {e}")
                    raise Exception(
                        f"Error code: {error_code or 'UNKNOWN'} - {str(e)}"
                    )
                
                # Calculate exponential backoff delay
                delay = initial_delay * (2 ** attempt)
                # Cap the delay at 60 seconds
                delay = min(delay, 60)
                
                logger.warning(
                    f"API error (attempt {attempt + 1}/{max_retries}): {e}. "
                    f"Retrying in {delay} seconds..."
                )
                time.sleep(delay)
        
        # If we get here, we have a successful response
        if 'response' not in locals():
            # This shouldn't happen, but just in case
            raise Exception(f"Failed to get response after {max_retries} attempts")
        
        response_text = response.choices[0].message.content
        
        # Clean up the response if it contains markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Parse the JSON response
        try:
            json_response = json.loads(response_text)
            return json_response
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            print(f"Raw response: {response_text}")
            return {"error": "Failed to parse response", "raw_response": response_text}

if __name__ == '__main__':
    # Input parameters
    industry = "health insurance"
    output_number = 10
    country = "USA"
    use_web_scraper = True  # Set to True to enable web scraping
    
    client = GeminiClient()
    result = client.generate_companies(industry, output_number, country)
    
    # Optionally enhance with web scraping
    if use_web_scraper:
        print("\n" + "="*50)
        print("ENHANCING DATA WITH WEB SCRAPING")
        print("="*50)
        
        from web_scraper import scrape_company_data
        result = scrape_company_data(result)
    
    # Pretty print the JSON output
    print("\n" + "="*50)
    print("FINAL RESULTS")
    print("="*50)
    print(json.dumps(result, indent=2))
    
    # Optionally, save to a file
    with open('leads.json', 'w') as f:
        json.dump(result, f, indent=2)
    print("\nResults saved to leads.json")
