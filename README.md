# ResumeCraft - Professional Resume Builder

A comprehensive full-stack resume builder application built with React, TypeScript, Node.js, and Express. Create, edit, and download professional resumes with 6 beautiful templates.

## ✨ Features

### 🎨 **Resume Creation & Editing**
- 6 Professional Templates (Modern Professional, Creative Edge, Executive Classic, Minimalist, Tech Developer, Academic Scholar)
- Real-time WYSIWYG editor with live preview
- Fully editable resume sections (Personal Info, Experience, Education, Skills)
- Canvas-based editing with control panel
- Auto-save and localStorage backup

### 📄 **Export Options**
- **PDF Download** - High-quality PDF generation with template styling
- **Word Document Download** - Microsoft Word compatible .docx format
- Multiple format support for maximum compatibility

### 🔐 **User Management**
- JWT-based authentication (Sign up, Sign in, Logout)
- User-specific resume storage and management
- Secure password hashing with bcrypt
- User profiles and settings

### 👨‍💼 **Admin Panel**
- User management and analytics
- Daily/total user statistics
- Resume template management (Create, Edit, Delete)
- Daily login/signup tracking
- Total resumes created metrics

### 💾 **Data Storage**
- **Dual Database Support**: PostgreSQL (default) or MongoDB
- Base64 PDF storage in database for user-specific access
- localStorage backup for offline editing
- Automatic cleanup of old localStorage data

### 🛡️ **Security & Performance**
- XSS prevention with input sanitization
- Responsive design for mobile and desktop
- Modern React 18 with TypeScript
- Optimized build with Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database OR MongoDB (optional)
- npm or yarn package manager

### 1. Clone and Install
```bash
git clone <repository-url>
cd ResumeCraft
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
```

**For PostgreSQL (Default):**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/resumebuilder
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
PORT=5000
```

**For MongoDB (Alternative):**
```env
MONGODB_URL=mongodb://localhost:27017/resumebuilder
# OR MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/resumebuilder
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
PORT=5000
```

### 3. Database Setup

**For PostgreSQL:**
```bash
# Push database schema
npm run db:push
```

**For MongoDB:**
```bash
# No setup needed - schemas are created automatically
```

### 4. Build and Run
```bash
# Build the client
npm run build

# Start the application
npm run dev
```

### 5. Access the Application
- **Application**: http://localhost:5000
- **Client Development Server** (optional): `npm run dev:client` → http://localhost:5173

## 📁 Project Structure

```
ResumeCraft/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and generators
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # In-memory storage (fallback)
│   ├── mongo-storage.ts    # MongoDB storage implementation
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
└── package.json            # Dependencies and scripts
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Run full-stack development server
npm run dev:client   # Run only client with HMR
npm run build        # Build for production
npm run build:client # Build only client
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema (PostgreSQL)
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, JWT Authentication
- **Database**: PostgreSQL (Drizzle ORM) or MongoDB (Mongoose)
- **PDF Generation**: jsPDF
- **Word Generation**: docx library
- **Build Tools**: Vite, esbuild

## 📊 Admin Features

### Analytics Dashboard
- Total registered users
- Daily signups counter
- Daily unique logins
- Total resumes created
- User activity tracking

### Template Management
- Add new resume templates
- Edit existing templates
- Delete templates
- Template categorization
- Preview functionality

### User Management
- View all registered users
- User activity status
- Resume count per user
- Account creation dates

## 🔧 Configuration Options

### Database Selection
The application supports both PostgreSQL and MongoDB:

1. **PostgreSQL** (Default): Set `DATABASE_URL` in .env
2. **MongoDB**: Set `MONGODB_URL` in .env (removes need for DATABASE_URL)

### Environment Variables
```env
# Database (choose one)
DATABASE_URL=postgresql://...     # For PostgreSQL
MONGODB_URL=mongodb://...         # For MongoDB

# Authentication
JWT_SECRET=your-secret-key        # Required

# Application
NODE_ENV=development              # development | production
PORT=5000                         # Server port

# Optional
REPL_ID=                          # For Replit deployment
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database URLs
3. Set a strong JWT secret
4. Ensure PORT environment variable is set

### Platform-Specific Notes
- **Replit**: Environment variables configured via Replit interface
- **Heroku**: Use Heroku Postgres add-on or MongoDB Atlas
- **Docker**: Copy .env file and expose port 5000

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review environment variable setup
3. Ensure database connection is working
4. Check browser console for errors

### Common Issues
- **Build errors**: Ensure all dependencies are installed with `npm install`
- **Database connection**: Verify DATABASE_URL or MONGODB_URL format
- **Permission errors**: Check file system permissions for logs and uploads

## 🌟 Features Roadmap

- [ ] Email resume sharing
- [ ] Resume versioning and history
- [ ] Collaborative editing
- [ ] More export formats (LaTeX, HTML)
- [ ] Advanced template customization
- [ ] Resume analytics and tips
- [ ] Integration with job boards
- [ ] AI-powered content suggestions
