# To run this code you need to install the following dependencies:
# pip install openai python-dotenv

import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class GeminiClient:
    def __init__(self):
        # Gemini's OpenAI-compatible endpoint
        base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
        
        self.client = OpenAI(
            api_key=os.getenv('GEMINI_API_KEY'),
            base_url=base_url
        )
    
    def generate_companies(self, industry, number, country):
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
        
        response = self.client.chat.completions.create(
            model="gemini-2.5-pro",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
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

