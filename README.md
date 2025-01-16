# MTN Store

An online store with MTN Mobile Money payment integration built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## Features

- User authentication
- Product catalog
- Shopping cart
- MTN Mobile Money integration
- Order management
- Admin dashboard
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- MongoDB
- NextAuth.js
- Zustand (State Management)
- React Hot Toast

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- MTN MOMO API credentials

## Getting Started

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd mtn-store
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Copy .env.local.example to .env.local and fill in your values:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- \`/src/app\` - Next.js app router pages and layouts
- \`/src/components\` - Reusable React components
- \`/src/lib\` - Utility functions and configurations
- \`/src/models\` - MongoDB models
- \`/src/utils\` - Helper functions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
