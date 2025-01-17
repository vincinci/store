# MTN Store

A modern e-commerce platform built with Next.js, featuring MTN Mobile Money integration and a comprehensive admin dashboard.

## Features

### Customer Features
- Browse and search products
- Shopping cart management
- Secure checkout with MTN Mobile Money
- Order tracking
- User authentication and profile management

### Admin Features
- Comprehensive dashboard with analytics
- Order management
- Product management
- Customer management
- Real-time sales tracking
- Email notifications

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Payment**: MTN Mobile Money Integration
- **Email**: Nodemailer with React Email templates
- **State Management**: Zustand
- **Charts**: Chart.js with react-chartjs-2

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mtn-store
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```env
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # MongoDB
   MONGODB_URI=your_mongodb_uri

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # MTN MoMo
   MTN_COLLECTION_API_URL=your_mtn_api_url
   MTN_COLLECTION_PRIMARY_KEY=your_primary_key
   MTN_COLLECTION_USER_ID=your_user_id
   MTN_COLLECTION_API_KEY=your_api_key

   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_specific_password
   SMTP_FROM_NAME=MTN Store
   SMTP_FROM_EMAIL=your_email@gmail.com
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mtn-store/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── emails/             # Email templates
│   ├── lib/                # Utility functions
│   └── models/             # MongoDB models
├── public/                 # Static assets
└── ...config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
