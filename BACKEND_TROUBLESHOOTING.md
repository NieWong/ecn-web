# Backend API Troubleshooting Guide

## Current Issue: 500 Internal Server Error on /posts endpoint

### Error Details
- **Endpoint**: `GET /posts?status=PUBLISHED&visibility=PUBLIC&sort=PUBLISHED_AT_DESC&take=20`
- **Status**: 500 Internal Server Error
- **Backend**: ecn-api running on port 4000

---

## Quick Fixes

### 1. Check Backend Logs
The backend should show detailed error messages. Check the terminal running `npm run dev` in the `ecn-api` directory.

Look for:
- Database connection errors
- Query errors
- Missing environment variables
- Prisma/ORM errors

### 2. Common Backend Issues

#### Issue: Database Not Connected
```bash
# Check if database is running
# Check .env file in backend has correct DATABASE_URL
```

#### Issue: No Data in Database
The API might crash if trying to query empty tables with relations.

**Solution**: Seed the database with test data
```bash
cd D:\dev\ecn-api
npm run seed  # or whatever your seed command is
```

#### Issue: Prisma Schema Not Synced
```bash
cd D:\dev\ecn-api
npx prisma generate
npx prisma db push
```

### 3. Test Backend API Directly

Open a new terminal and test the API:

```bash
# Test health check (if available)
curl http://localhost:4000/api/health

# Test posts endpoint without filters
curl http://localhost:4000/api/posts

# Test with simple filter
curl "http://localhost:4000/api/posts?take=5"

# Test the full query
curl "http://localhost:4000/api/posts?status=PUBLISHED&visibility=PUBLIC&sort=PUBLISHED_AT_DESC&take=20"
```

Or use a REST client like Postman/Insomnia.

### 4. Check Backend Route Handler

The backend route for `/posts` might have issues with:

#### Query Parameter Names
Make sure the backend expects:
- `status` (not `postStatus`)
- `visibility` (not `postVisibility`)
- `sort` (and supports the value `PUBLISHED_AT_DESC`)
- `take` (for limit)
- `categoryId` (optional)

#### Example Backend Code (Express/Prisma)
```typescript
router.get('/posts', async (req, res) => {
  try {
    const { status, visibility, categoryId, sort, take, skip } = req.query;
    
    const posts = await prisma.post.findMany({
      where: {
        status: status as PostStatus || undefined,
        visibility: visibility as Visibility || undefined,
        categoryId: categoryId as string || undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        coverFile: true,
        categories: true,
      },
      orderBy: sort === 'PUBLISHED_AT_DESC' 
        ? { publishedAt: 'desc' } 
        : { createdAt: 'desc' },
      take: take ? parseInt(take as string) : 20,
      skip: skip ? parseInt(skip as string) : 0,
    });
    
    res.json(posts);
  } catch (error) {
    console.error('Posts error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      details: error.message 
    });
  }
});
```

### 5. Check Backend CORS Configuration

Make sure CORS allows localhost:3000:

```typescript
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));
```

---

## Frontend Workarounds (Temporary)

### Option 1: Simplify the Query

Try fetching posts without filters first:

```typescript
// In app/page.tsx loadPosts()
const data = await postsAPI.list({
  take: 20,
});
```

### Option 2: Use Mock Data

Create a mock data file while backend is being fixed:

```typescript
// lib/mock-data.ts
export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js',
    slug: 'getting-started-with-nextjs',
    summary: 'Learn how to build modern web applications with Next.js',
    contentHtml: '<p>Content here...</p>',
    status: PostStatus.PUBLISHED,
    visibility: Visibility.PUBLIC,
    authorId: '1',
    coverFileId: null,
    coverFile: null,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add more mock posts...
];
```

Then use it temporarily:
```typescript
import { mockPosts } from '@/lib/mock-data';

const loadPosts = async () => {
  try {
    const data = await postsAPI.list({ ... });
    setPosts(data);
  } catch (err) {
    console.warn('Using mock data due to API error');
    setPosts(mockPosts); // Fallback to mock data
  }
};
```

---

## Debugging Steps

### Step 1: Check Backend Console Output
Look for stack traces in the backend terminal.

### Step 2: Check Browser Console
The frontend now logs detailed error info. Open DevTools → Console.

### Step 3: Check Network Tab
DevTools → Network → Click the failed request to see:
- Request headers
- Query parameters
- Response body (might have error details)

### Step 4: Test Backend Independently
Use curl or Postman to test the API without the frontend.

### Step 5: Check Database
```sql
-- Check if posts table has data
SELECT COUNT(*) FROM posts;

-- Check if there are published posts
SELECT * FROM posts WHERE status = 'PUBLISHED' LIMIT 5;
```

---

## Expected Backend Response

The backend should return an array of posts:

```json
[
  {
    "id": "uuid",
    "title": "Article Title",
    "slug": "article-title",
    "summary": "Brief summary",
    "contentHtml": "<p>Content...</p>",
    "status": "PUBLISHED",
    "visibility": "PUBLIC",
    "authorId": "uuid",
    "author": {
      "id": "uuid",
      "name": "Author Name",
      "email": "author@example.com",
      "profilePicture": { ... }
    },
    "coverFile": { ... },
    "categories": [ ... ],
    "publishedAt": "2026-02-26T...",
    "createdAt": "2026-02-26T...",
    "updatedAt": "2026-02-26T..."
  }
]
```

---

## Next Steps

1. **Check backend logs** for the actual error message
2. **Verify database connection** and data
3. **Test API directly** with curl
4. **Fix backend route** if there are issues
5. **Restart both servers** after fixes

The frontend is now ready with better error handling and will display helpful messages!

---

## Contact Points

- Frontend runs on: http://localhost:3000
- Backend should run on: http://localhost:4000
- API base: http://localhost:4000/api

Make sure both are running simultaneously for the app to work.
