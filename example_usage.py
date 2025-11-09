"""
Example usage of the Lead Generator with Web Scraping

This script demonstrates how to:
1. Generate company leads using AI
2. Enhance the data with web scraping
3. Save results to a file
"""

import os
import json
from dotenv import load_dotenv
from generate_health_insurance import GeminiClient
from web_scraper import scrape_company_data

# Load environment variables
load_dotenv()

def generate_leads_with_scraping(industry: str, number: int, country: str, enable_scraping: bool = True):
    """
    Generate leads with optional web scraping enhancement
    
    Args:
        industry: The industry to target (e.g., "health insurance", "technology")
        number: Number of companies to generate
        country: Country to focus on (e.g., "USA", "UK", "Canada")
        enable_scraping: Whether to enhance data with web scraping
    
    Returns:
        Dictionary containing company lead data
    """
    
    print("="*60)
    print(f"GENERATING LEADS FOR {industry.upper()}")
    print(f"Country: {country} | Number of Companies: {number}")
    print("="*60)
    
    # Step 1: Generate AI-powered leads
    print("\n[Step 1/2] Generating leads with AI...")
    client = GeminiClient()
    result = client.generate_companies(industry, number, country)
    
    print(f"✓ Generated {len(result.get('companies', []))} companies")
    
    # Step 2: Enhance with web scraping (optional)
    if enable_scraping:
        print("\n[Step 2/2] Enhancing data with web scraping...")
        print("This may take a few minutes...\n")
        result = scrape_company_data(result)
        print("\n✓ Web scraping completed")
    else:
        print("\n[Step 2/2] Skipping web scraping (disabled)")
    
    return result

def save_results(data: dict, filename: str = "leads.json"):
    """Save results to a JSON file"""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\n✓ Results saved to {filename}")

def display_summary(data: dict):
    """Display a summary of the generated leads"""
    companies = data.get('companies', [])
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    print(f"\nTotal Companies: {len(companies)}")
    
    # Count companies with contact emails
    with_emails = sum(1 for c in companies if c.get('contact_email'))
    print(f"Companies with Contact Emails: {with_emails}")
    
    # Count companies with social media
    with_social = sum(1 for c in companies if c.get('social_media'))
    print(f"Companies with Social Media: {with_social}")
    
    # Display first 3 companies as examples
    print("\nSample Companies:")
    for i, company in enumerate(companies[:3], 1):
        print(f"\n{i}. {company.get('company_name', 'N/A')}")
        print(f"   Website: {company.get('website_url', 'N/A')}")
        print(f"   Email: {company.get('contact_email', 'None found')}")
        print(f"   Users: {company.get('number_of_users', 'N/A')}")

# Example 1: Generate leads with web scraping
if __name__ == "__main__":
    # Configuration
    INDUSTRY = "health insurance"
    NUMBER = 5  # Start with 5 for faster testing
    COUNTRY = "USA"
    ENABLE_SCRAPING = True  # Set to False to skip web scraping
    
    # Generate leads
    leads = generate_leads_with_scraping(
        industry=INDUSTRY,
        number=NUMBER,
        country=COUNTRY,
        enable_scraping=ENABLE_SCRAPING
    )
    
    # Save results
    save_results(leads, "leads_output.json")
    
    # Display summary
    display_summary(leads)
    
    print("\n" + "="*60)
    print("COMPLETE! Check leads_output.json for full details.")
    print("="*60)

