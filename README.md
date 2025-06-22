# Croesus - AI-Powered Article Analysis API

## Introduction

This project was developed by **Sami Hanine** for **Croesus**.

The application is a Next.js-based API that leverages Google Cloud's Natural Language Processing services to analyze news articles and extract meaningful insights about organizations and sentiment analysis.

## Configuration

### Prerequisites

- Node.js
- pnpm package manager
- Google Cloud Platform account with the following APIs enabled:
  - Google Cloud Natural Language API
  - Google Knowledge Graph Search API

### Environment Variables

Create a `.env` file in the root directory with the following Google Cloud credentials:

```env
# Google Cloud Natural Language API Credentials
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
GOOGLE_UNIVERSE_DOMAIN=googleapis.com

# Google Knowledge Graph API Key
GOOGLE_KG_API_KEY=your-knowledge-graph-api-key
```

### Installation & Launch

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   pnpm dev
   ```

3. **Build for production:**
   ```bash
   pnpm build
   pnpm start
   ```

The API will be available at `http://localhost:3000/api/analyze`

### Usage

Send a GET request to the API endpoint with a `url` parameter:

```
GET /api/analyze?url=https://example.com/article
```
