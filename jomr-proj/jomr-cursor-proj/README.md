This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Option 1: Docker (Recommended)

The easiest way to run this project locally is using Docker:

```bash
# Production mode
docker-compose up --build

# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up --build
```

See [DOCKER.md](./DOCKER.md) for detailed Docker instructions.

**💡 Running in VS Code?** Check out [VSCODE_DOCKER.md](./VSCODE_DOCKER.md) for VS Code-specific Docker workflows.

### Option 2: Local Development

First, install dependencies and set up environment variables:

```bash
yarn install
# Create .env.local with your Supabase credentials (see SUPABASE_SETUP.md)
```

Then run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Documentation

- [DOCKER.md](./DOCKER.md) - Docker setup and usage guide
- [VSCODE_DOCKER.md](./VSCODE_DOCKER.md) - Running Docker in VS Code guide
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase configuration guide
- [CRUD_REVIEW.md](./CRUD_REVIEW.md) - API implementation review

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
