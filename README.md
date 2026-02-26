# ECN News Platform - Frontend

A Medium-like news and article platform built with Next.js 14+, TypeScript, and Tailwind CSS.

## 🚀 Features Implemented

### ✅ Core Features
- **Landing Page** - Hero section with featured articles and category filtering
- **Article Feed** - Grid layout with article cards, trending topics
- **Article View** - Full article page with rich content display
- **User Authentication** - Login, Register, Set Password pages
- **User Profiles** - Public profile pages with author's articles
- **Responsive Design** - Mobile-first, works on all screen sizes

### ✅ Components
- **Header/Navigation** - Sticky header with search, user menu
- **Footer** - Links and social media
- **Article Cards** - Reusable card component with cover images
- **Auth Provider** - Global authentication state management

### ✅ API Integration
- Complete API client setup with Axios
- Interceptors for authentication
- Error handling and token management
- Endpoints for:
  - Authentication (login, register, set password)
  - Posts/Articles (list, get, create, update)
  - Users (profile, public profile)
  - Categories
  - File uploads

### ✅ State Management
- Zustand for auth state
- Persistent token storage
- Auto-refresh user data

### ✅ Styling
- Tailwind CSS v4
- Custom Medium-style typography
- Prose styles for article content
- Inter font for UI, Merriweather for content

## 📦 Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: Axios
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **UI Components**: Radix UI
- **Content Sanitization**: DOMPurify

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:4000`

### Installation

1. Navigate to project directory:
```bash
cd d:/dev/ecn-web
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Configure environment variables:
The `.env.local` file contains:
```
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
```

Update this if your API runs on a different URL.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
ecn-web/
├── app/
│   ├── article/[slug]/      # Article view page
│   ├── profile/[id]/        # User profile page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── set-password/        # Set password page
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Homepage/landing page
│   └── globals.css          # Global styles + prose styles
├── components/
│   ├── articles/
│   │   └── article-card.tsx # Article card component
│   ├── layout/
│   │   ├── header.tsx       # Navigation header
│   │   └── footer.tsx       # Footer
│   ├── providers/
│   │   └── auth-provider.tsx # Auth state provider
│   └── ui/
│       └── button.tsx       # Button component (shadcn)
├── lib/
│   ├── api/
│   │   ├── client.ts        # Axios client setup
│   │   ├── auth.ts          # Auth API calls
│   │   ├── posts.ts         # Posts API calls
│   │   ├── users.ts         # Users API calls
│   │   ├── files.ts         # Files API calls
│   │   ├── categories.ts    # Categories API calls
│   │   └── index.ts         # API exports
│   ├── store/
│   │   └── auth-store.ts    # Zustand auth store
│   ├── types.ts             # TypeScript interfaces
│   ├── helpers.ts           # Utility functions
│   └── utils.ts             # Tailwind utils
└── public/                  # Static assets
```

## 🔐 Authentication Flow

1. **Registration**:
   - User submits email and optional name
   - Account created but marked as inactive
   - Awaits admin approval

2. **Admin Approval**:
   - Admin reviews pending registrations
   - Approves account (sets `isActive: true`)

3. **Set Password**:
   - Approved user sets password
   - Receives JWT token
   - Can now login

4. **Login**:
   - User enters email and password
   - Receives JWT token
   - Token stored in localStorage
   - Auto-attached to API requests

## 📝 Key Pages

### Homepage (`/`)
- Hero section with call-to-action
- Trending topics/categories filter
- Featured article (large card)
- Article grid (cards)
- Public posts only (unauthenticated)

### Article Page (`/article/[slug]`)
- Full-width cover image
- Title, summary, metadata
- Author card with profile link
- Rich text content with prose styling
- Related articles section

### Profile Page (`/profile/[id]`)
- Profile picture and name
- About me section
- Social links (Facebook, Twitter, LinkedIn, Website)
- CV download button
- Published articles grid

### Login Page (`/login`)
- Email and password inputs
- Error handling for various scenarios
- Link to register and set password

### Register Page (`/register`)
- Email and name inputs
- Success message after submission
- Information about approval process

### Set Password Page (`/set-password`)
- Email and password inputs
- Password confirmation
- Validation (min 6 characters)

## 🚧 Pages Still To Build

1. **Write/Edit Article Page** (`/write`, `/write/[id]`) - Rich text editor
2. **Settings Page** (`/settings`) - Profile editing
3. **Admin Dashboard** (`/admin`) - User and content management
4. **My Articles Page** (`/my-articles`) - User's own articles
5. **Search Page** (`/search`) - Search results
6. **Static Pages** - About, Terms, Privacy, Contact

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## ✅ Build Status

```
✓ Compiled successfully
✓ TypeScript checks passed
✓ All pages generated
✓ Production build ready
```

---

**Built with ❤️ using Next.js and TypeScript**

