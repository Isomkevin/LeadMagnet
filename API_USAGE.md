# Lead Generator API Documentation

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure API Key

Create a `.env` file:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the API Server

```bash
python api.py
```

The API will be available at: **http://localhost:8000**

### 4. View API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "version": "1.0.0",
  "gemini_api_configured": true
}
```

---

### Generate Leads (Synchronous)
```bash
POST /api/v1/leads/generate
```

**Request Body:**
```json
{
  "industry": "health insurance",
  "number": 10,
  "country": "USA",
  "enable_web_scraping": false
}
```

**Parameters:**
- `industry` (string, required): Target industry (2-100 chars)
- `number` (integer, required): Number of companies (1-50)
- `country` (string, required): Target country (2-100 chars)
- `enable_web_scraping` (boolean, optional): Enable web scraping (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Successfully generated 10 leads",
  "data": {
    "companies": [
      {
        "company_name": "UnitedHealth Group",
        "website_url": "https://www.unitedhealthgroup.com",
        "company_size": "400,000+",
        "headquarters_location": "Minnetonka, Minnesota, USA",
        "revenue_market_cap": "$371.6 billion",
        "contact_email": "info@uhg.com",
        "social_media": {
          "linkedin": "https://linkedin.com/...",
          "twitter": "https://twitter.com/..."
        },
        ...
      }
    ]
  },
  "metadata": {
    "industry": "health insurance",
    "country": "USA",
    "requested_count": 10,
    "actual_count": 10,
    "web_scraping_enabled": false,
    "generated_at": "2024-01-01T12:00:00"
  }
}
```

---

### Generate Leads (Asynchronous)
```bash
POST /api/v1/leads/generate-async
```

Use this for web scraping enabled requests (recommended for 10+ companies).

**Request Body:**
```json
{
  "industry": "technology",
  "number": 20,
  "country": "USA",
  "enable_web_scraping": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead generation job queued",
  "job_id": "job_1234567890_technology",
  "status_endpoint": "/api/v1/leads/status/job_1234567890_technology"
}
```

---

### Check Job Status
```bash
GET /api/v1/leads/status/{job_id}
```

**Response (Processing):**
```json
{
  "job_id": "job_1234567890_technology",
  "status": "processing",
  "created_at": "2024-01-01T12:00:00",
  "started_at": "2024-01-01T12:00:05"
}
```

**Response (Completed):**
```json
{
  "job_id": "job_1234567890_technology",
  "status": "completed",
  "created_at": "2024-01-01T12:00:00",
  "completed_at": "2024-01-01T12:05:00",
  "result": {
    "companies": [...]
  }
}
```

**Status Values:**
- `queued`: Job waiting to be processed
- `processing`: Job currently running
- `completed`: Job finished successfully
- `failed`: Job encountered an error

---

### Export Leads
```bash
GET /api/v1/leads/export/{job_id}?format=json
```

**Parameters:**
- `format` (string): Export format (`json` or `csv`)

---

## 🔧 cURL Examples

### Health Check
```bash
curl http://localhost:8000/health
```

### Generate Leads (Sync, No Scraping)
```bash
curl -X POST http://localhost:8000/api/v1/leads/generate \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "technology",
    "number": 5,
    "country": "USA",
    "enable_web_scraping": false
  }'
```

### Generate Leads (Async, With Scraping)
```bash
curl -X POST http://localhost:8000/api/v1/leads/generate-async \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "health insurance",
    "number": 10,
    "country": "USA",
    "enable_web_scraping": true
  }'
```

### Check Job Status
```bash
curl http://localhost:8000/api/v1/leads/status/job_1234567890_technology
```

---

## 🐍 Python Client Example

```python
import requests

# API Configuration
API_URL = "http://localhost:8000"

# Generate leads
response = requests.post(
    f"{API_URL}/api/v1/leads/generate",
    json={
        "industry": "health insurance",
        "number": 10,
        "country": "USA",
        "enable_web_scraping": False
    }
)

result = response.json()
companies = result['data']['companies']

for company in companies:
    print(f"{company['company_name']} - {company['website_url']}")
```

---

## 🌐 JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:8000';

async function generateLeads() {
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/leads/generate`,
      {
        industry: 'technology',
        number: 10,
        country: 'USA',
        enable_web_scraping: false
      }
    );
    
    const companies = response.data.data.companies;
    console.log(`Generated ${companies.length} leads`);
    
    companies.forEach(company => {
      console.log(`${company.company_name} - ${company.website_url}`);
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

generateLeads();
```

---

## ⚙️ Response Data Structure

Each company in the response includes:

| Field | Type | Description |
|-------|------|-------------|
| `company_name` | string | Official company name |
| `website_url` | string | Company website |
| `company_size` | string | Number of employees |
| `headquarters_location` | string | HQ city and country |
| `revenue_market_cap` | string | Revenue/market cap |
| `key_products_services` | string | Main offerings |
| `target_market` | string | Customer segments |
| `number_of_users` | string | Total users/customers |
| `notable_customers` | array | Known clients |
| `social_media` | object | Social media links (LLM) |
| `social_media_scraped` | object | Social media links (scraped) |
| `contact_email` | string | Primary contact email |
| `contact_email_llm` | string | Email from LLM |
| `additional_emails` | array | All emails found |
| `recent_news_insights` | string | Recent developments |
| `decision_maker_roles` | array | Key decision maker roles |

---

## 🚦 Rate Limiting

- Maximum 50 companies per request
- Recommended: Use async endpoint for 10+ companies with web scraping
- Web scraping adds ~2-5 seconds per company

---

## 🔒 Production Considerations

### Security
1. Add API authentication (JWT, API keys)
2. Configure CORS for specific origins
3. Add rate limiting middleware
4. Use HTTPS in production

### Scalability
1. Replace in-memory storage with Redis/Database
2. Use Celery for background tasks
3. Add caching for repeated queries
4. Deploy with Gunicorn/Docker

### Monitoring
1. Add logging (structured logs)
2. Implement health metrics
3. Add error tracking (Sentry)
4. Monitor API performance

---

## 🛠️ Deployment

### Using Uvicorn (Production)
```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t lead-generator-api .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key lead-generator-api
```

---

## 📝 Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "detail": "Validation error: number must be between 1 and 50"
}
```

**500 Internal Server Error**
```json
{
  "detail": "GEMINI_API_KEY not configured"
}
```

**404 Not Found**
```json
{
  "detail": "Job not found"
}
```

---

## 🔍 Testing

Use the provided client:
```bash
python api_client_example.py
```

Or test with Swagger UI:
http://localhost:8000/docs

---

## 📞 Support

For issues or questions:
1. Check the API documentation: `/docs`
2. Review error messages in responses
3. Check server logs for detailed errors

---

## 📄 License

This API is for business and educational use. Use responsibly and ethically.

