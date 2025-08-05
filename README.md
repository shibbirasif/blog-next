# Next.js Blog Application

A modern, full-featured blog platform built with Next.js 15, featuring user authentication, rich text editing, image uploads, profile management, and AI-powered writing assistance.

## 🚀 Features

### ✅ Completed Features

- **Authentication & Authorization**
  - User registration and login with NextAuth.js
  - Secure session management with JWT
  - Protected routes and middleware

- **User Profile Management**
  - Edit profile information (name, bio)
  - Avatar upload with cropping functionality
  - Rich text bio editor with image support
  - Profile picture management
  - Real-time profile updates

- **Rich Text Editor**
  - TipTap-based WYSIWYG editor
  - Image upload and embedding
  - Toolbar with formatting options
  - File management system
  - Auto-save functionality

- **Article Management**
  - Create and edit articles
  - Rich content with embedded images
  - Tag system for categorization
  - Draft and publish functionality
  - Article versioning

- **File Management**
  - Image upload with validation
  - File attachment system
  - Automatic cleanup of unused files
  - Support for multiple file types
  - Image cropping and optimization

- **UI/UX**
  - Responsive design with Tailwind CSS
  - Flowbite React components
  - Loading skeletons and animations
  - Dark mode support
  - Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Runtime**: Node.js 22+
- **Styling**: Tailwind CSS, Flowbite React
- **Authentication**: NextAuth.js v5
- **Database**: MongoDB with Mongoose
- **Rich Text**: TipTap Editor
- **Image Processing**: React Easy Crop
- **Form Handling**: React Hook Form + Zod validation
- **File Upload**: Custom upload system with FormData
- **AI Integration**: OpenAI API (planned)

## 📋 Prerequisites

- **Node.js 22+** (Required for Next.js 15)
- **MongoDB** (Local or Atlas)
- **npm** or **yarn** package manager

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB

   # macOS (with Homebrew)
   brew services start mongodb/brew/mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string from "Connect" → "Connect your application"

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd blog-next
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blog-next
# For MongoDB Atlas: mongodb+srv://<your mongodb atlas db uri>

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880

# AI Configuration (Optional - for future features)
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4-turbo
```

### 4. Initialize Database
```bash
# Run database migrations/seeders (if any)
npm run db:seed
```

### 5. Start the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (user)/            # User-specific pages
│   │   └── user/[id]/     # Dynamic user routes
│   │       ├── (profile)/ # Profile pages
│   │       └── (settings)/# Settings pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/             # Reusable components
│   ├── article/           # Article-related components
│   ├── profile/           # Profile management
│   ├── richTextEditor/    # TipTap editor components
│   └── ui/                # UI components
├── lib/                   # Configuration & utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # Database connection
│   └── ai.ts             # AI integration (planned)
├── models/                # Mongoose models
├── services/              # Business logic layer
├── utils/                 # Utility functions
├── validations/           # Zod validation schemas
└── constants/             # App constants
```

## 🎯 Upcoming Features

### 🤖 AI-Powered Features (Priority)
- [ ] **AI Writing Assistant**
  - Content suggestions and auto-completion
  - Grammar and style corrections
  - SEO optimization suggestions
  - Tone and voice adjustments

- [ ] **Smart Search**
  - Semantic search across articles
  - AI-powered content recommendations
  - Natural language queries
  - Search result summarization

### 🔄 In Progress
- [ ] Comment system for articles
- [ ] Advanced article categorization
- [ ] Email notifications
- [ ] Real-time collaboration
- [ ] Role-based access control

### 📝 Planned Features
- [ ] Social media integration
- [ ] Article bookmarking system
- [ ] User following/follower system
- [ ] Advanced analytics dashboard
- [ ] SEO optimization tools
- [ ] PWA support
- [ ] Multi-language support
- [ ] Article templates library
- [ ] Export functionality (PDF, EPUB)
- [ ] Advanced file management
- [ ] Content scheduling

### 🎨 UI/UX Improvements
- [ ] Enhanced mobile experience
- [ ] Advanced theme customization
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Performance optimizations
- [ ] Better loading states
- [ ] Micro-interactions

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run e2e tests with Playwright
npm run test:e2e

# Run all tests
npm run test:all
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t blog-next .
docker run -p 3000:3000 blog-next
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🎛️ Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | - |
| `NEXTAUTH_SECRET` | JWT secret key | ✅ | - |
| `NEXTAUTH_URL` | App URL for callbacks | ✅ | - |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ❌ | - |
| `UPLOAD_DIR` | File upload directory | ❌ | `public/uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | ❌ | `5242880` |

## 📸 Screenshots

### Home Page
![Home Page Screenshot](screenshots/home.png)

### Article Editor with AI Assistant
![Editor Screenshot](screenshots/editor-ai.png)

### Profile Management
![Profile Screenshot](screenshots/profile.png)

### AI Search Interface
![Search Screenshot](screenshots/ai-search.png)

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript check

# Database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset database

# Testing
npm run test         # Run all tests
npm run test:unit    # Unit tests only
npm run test:e2e     # E2E tests only
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write tests for new features
- Update documentation

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"
```

**Node.js Version Issues**
```bash
# Check Node version
node --version
# Should be 22.x.x or higher
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js 15](https://nextjs.org/) - React framework
- [TipTap](https://tiptap.dev/) - Rich text editor
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Flowbite](https://flowbite.com/) - UI components
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [OpenAI](https://openai.com/) - AI capabilities

## 📞 Support

- 📧 Email: [your-email@example.com](mailto:your-email@example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/blog-next/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/blog-next/discussions)

---

⭐ Star this repository if you find it helpful!

**Built with ❤️ using Next.js 15 and Node.js 22**