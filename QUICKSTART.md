# Quick Start Guide - ECN News Platform

## 🚀 Getting Started in 5 Minutes

### Step 1: Ensure Prerequisites
- ✅ Node.js 18+ installed
- ✅ Backend API running on `http://localhost:4000`

### Step 2: Start Development Server
```bash
cd d:/dev/ecn-web
npm run dev
```

### Step 3: Open Browser
Visit [http://localhost:3000](http://localhost:3000)

---

## 📋 What You'll See

### Landing Page (/)
- Hero section: "Stay Curious"
- Trending topics filter
- Article feed (empty if no data from API)
- Header with search and auth buttons
- Footer with links

### Try These Actions

#### As a Visitor (Not Logged In)
1. **Browse Articles** - View public articles on homepage
2. **Click Article** - Read full article content
3. **View Profile** - Click author name to see their profile
4. **Register** - Click "Get Started" or "Sign Up"

#### Register Flow
1. Go to `/register`
2. Enter email: `test@example.com`
3. Enter name: `Test User`
4. Submit → Shows "Registration Submitted" message
5. Wait for admin approval (requires backend)

#### After Admin Approval
1. Go to `/set-password`
2. Enter approved email
3. Set password (min 6 chars)
4. Auto-redirected to homepage, now logged in

#### As Logged In User
1. **Header Changes** - Shows profile pic and "Write" button
2. **User Menu** - Click avatar to see:
   - My Profile
   - My Articles
   - Settings
   - Sign Out
3. **Write Button** - Access article editor (to be built)
4. **Read Private Articles** - Can now view members-only content

---

## 🧪 Testing the App

### Test Authentication

```bash
# 1. Register a test user
Go to: http://localhost:3000/register
Email: test@example.com
Name: Test User

# 2. Admin approves (via backend/API)
POST /users/{userId}/approve

# 3. Set password
Go to: http://localhost:3000/set-password
Email: test@example.com
Password: test123

# 4. Should auto-login and redirect to home
```

### Test Article Viewing

```bash
# Make sure backend has some test articles
# Then visit homepage - should see article cards

# Click any article
# Should show:
- Cover image
- Title and summary
- Author info
- Full content (HTML rendered with prose styles)
- Related articles section
```

### Test Profile Page

```bash
# Click any author name or visit:
http://localhost:3000/profile/{userId}

# Should show:
- Profile picture
- Name and bio
- Social links
- CV download (if uploaded)
- List of published articles
```

---

## 🎨 UI Components Preview

### Header
- Logo (left)
- Search bar (center)
- Auth buttons or user menu (right)
- Mobile: Search moves below header

### Article Card
- Cover image (2:1 aspect ratio)
- Author avatar and name
- Title (2 lines max)
- Summary (2 lines max)
- Meta: date, read time, category badge
- "Members only" badge if private

### Article Page
- Hero cover image
- Centered content (max 680px)
- Large serif typography (21px, line-height 1.58)
- Author card with follow option spot
- Prose-styled content

### Profile Page
- Large profile picture
- Name and bio
- Social icons
- CV download button
- Articles grid below

---

## 🔧 Common Issues & Solutions

### Issue: Build Errors
```bash
# Solution: Rebuild
npm run build
```

### Issue: API Connection Failed
```bash
# Check .env.local has correct API URL
NEXT_PUBLIC_API_BASE=http://localhost:4000/api

# Verify backend is running on port 4000
```

### Issue: No Articles Showing
```bash
# Make sure backend has:
1. Categories created
2. Articles published with PUBLIC visibility
3. CORS enabled for localhost:3000
```

### Issue: Images Not Loading
```bash
# Check backend serves files at:
http://localhost:4000/uploads/{storageKey}

# Update lib/helpers.ts getImageUrl() if different
```

### Issue: Login Fails
```bash
# Check browser console for errors
# Verify token is stored in localStorage
localStorage.getItem('auth_token')

# Clear token if invalid
localStorage.removeItem('auth_token')
```

---

## 📊 API Requirements

For the frontend to work properly, ensure the backend provides:

### Required Endpoints
- `GET /posts` - List articles with filters
- `GET /posts/:id` - Get single article
- `GET /categories` - List categories
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/set-password` - Set password after approval
- `GET /auth/me` - Get current user
- `GET /users/public/:id` - Get public profile
- `GET /uploads/:storageKey` - Serve uploaded files

### Test Data Needed
1. **Categories**: At least 3-5 categories (Tech, Design, Business, etc.)
2. **Articles**: 10+ published articles with:
   - Public visibility
   - Cover images
   - Rich HTML content
   - Associated categories
3. **Users**: Test accounts with profile pictures

---

## 📁 Directory Tour

```bash
# Key files to know:
app/page.tsx              # Landing page
app/article/[slug]/page.tsx   # Article view
app/login/page.tsx        # Login form
components/layout/header.tsx  # Navigation
lib/api/                  # API client
lib/store/auth-store.ts   # Auth state
lib/types.ts              # TypeScript definitions
```

---

## 🎯 Next Development Tasks

### Immediate Priority
1. **Rich Text Editor** - Build `/write` page with TipTap
2. **Settings Page** - Profile editing at `/settings`
3. **Admin Dashboard** - User approval at `/admin`

### Features to Add
4. Search functionality
5. My articles page
6. Comments system
7. Like/clap feature
8. Follow authors
9. Email notifications

---

## 💡 Tips

### Development
- Hot reload is enabled - changes appear instantly
- Check browser console for API errors
- Use React DevTools to inspect component state

### Debugging
- Auth state: `useAuthStore.getState()` in console
- Check Network tab for API calls
- Verify JWT token in localStorage

### Styling
- Tailwind classes work out of the box
- Custom prose styles in `globals.css`
- Use `className` not `class`

---

## 📞 Need Help?

1. Check [README.md](./README.md) for full documentation
2. Review [Frontend Spec](./FRONTEND_SPEC.md) for requirements
3. Inspect browser console for error messages
4. Verify backend API is running and accessible

---

**Happy Coding! 🎉**
