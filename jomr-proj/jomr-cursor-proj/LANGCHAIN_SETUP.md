# LangChain + Google Gemini Setup

The AI Chat feature uses [LangChain.js](https://js.langchain.com/) with [Google Gemini](https://ai.google.dev/) as the primary model.

## 1. Get Your Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key

## 2. Set Up Environment Variables

Add to your env file (e.g. `./src/app/.env.local` or project root `.env.local`):

```env
GOOGLE_API_KEY=your-google-api-key-here  AIzaSyDtas7unhkheeIGCleIlxxbH5Z1ucHek3I
```

**Optional** – override the default model:

```env
GEMINI_MODEL=gemini-2.5-flash
```

Supported models include `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`, etc. Default is `gemini-2.5-flash`.

## 3. Docker

When running in Docker, ensure `GOOGLE_API_KEY` is in the same env file used by docker-compose (e.g. `./src/app/.env.local`). The compose files load env from that file automatically.

## 4. Verify

1. Start the app (via Docker or locally)
2. Go to **AI Chat** in the sidebar
3. Send a message – you should get a response from Gemini

## Troubleshooting

### "Missing GOOGLE_API_KEY"

- Ensure `GOOGLE_API_KEY` is set in your env file
- Restart the app after changing env vars
- For Docker: rebuild if needed: `docker-compose up --build`

### 503 / API errors

- Check your API key is valid and has quota
- Verify the key has access to the Gemini API in Google AI Studio
