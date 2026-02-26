# Common Backend Fixes for 500 Error

## The Issue
The frontend is getting a 500 Internal Server Error when calling:
```
GET /posts?status=PUBLISHED&visibility=PUBLIC&sort=PUBLISHED_AT_DESC&take=20
```

## Most Likely Causes

### 1. **Database Not Seeded / Empty Tables**
If the database is empty or missing related data, the query might fail.

**Fix:**
```bash
cd D:\dev\ecn-api

# Run migrations
npx prisma db push

# Seed the database
npx prisma db seed
# OR
npm run seed
```

### 2. **Query Parameter Type Issues**
The backend might be trying to parse query params as wrong types.

**Backend Fix (in your posts route):**
```typescript
// Make sure to parse numbers and handle undefined
const take = req.query.take ? parseInt(req.query.take as string) : 20;
const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

// Safely handle enums
const status = req.query.status as PostStatus | undefined;
const visibility = req.query.visibility as Visibility | undefined;
```

### 3. **Missing Relations in Prisma Query**
If the query includes relations that don't exist or aren't properly set up.

**Backend Fix:**
```typescript
const posts = await prisma.post.findMany({
  where: {
    status: status || undefined,
    visibility: visibility || undefined,
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
    coverFile: true, // Make sure this relation exists in Prisma schema
    categories: true, // Make sure this relation exists in Prisma schema
  },
  orderBy: { publishedAt: 'desc' },
  take,
  skip,
});
```

### 4. **Sort Parameter Not Handled**
The backend might not know how to handle `PUBLISHED_AT_DESC`.

**Backend Fix:**
```typescript
// Parse sort parameter
let orderBy = {};
if (req.query.sort === 'PUBLISHED_AT_DESC') {
  orderBy = { publishedAt: 'desc' };
} else if (req.query.sort === 'PUBLISHED_AT_ASC') {
  orderBy = { publishedAt: 'asc' };
} else if (req.query.sort === 'CREATED_AT_DESC') {
  orderBy = { createdAt: 'desc' };
} else {
  orderBy = { createdAt: 'desc' }; // default
}
```

## Quick Test Commands

### Test 1: Check if backend responds at all
```bash
curl http://localhost:4000/api/posts
```

### Test 2: Test with minimal params
```bash
curl "http://localhost:4000/api/posts?take=5"
```

### Test 3: Test each parameter individually
```bash
curl "http://localhost:4000/api/posts?status=PUBLISHED"
curl "http://localhost:4000/api/posts?visibility=PUBLIC"
curl "http://localhost:4000/api/posts?sort=PUBLISHED_AT_DESC"
```

## Recommended Backend Posts Route

Here's a robust implementation:

```typescript
// src/routes/posts.ts
import { Router } from 'express';
import { PrismaClient, PostStatus, Visibility } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/posts', async (req, res) => {
  try {
    // Parse query parameters safely
    const status = req.query.status as PostStatus | undefined;
    const visibility = req.query.visibility as Visibility | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const search = req.query.search as string | undefined;
    const authorId = req.query.authorId as string | undefined;
    const take = req.query.take ? Math.min(parseInt(req.query.take as string), 100) : 20;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (req.query.sort === 'PUBLISHED_AT_DESC') orderBy = { publishedAt: 'desc' };
    if (req.query.sort === 'PUBLISHED_AT_ASC') orderBy = { publishedAt: 'asc' };
    if (req.query.sort === 'CREATED_AT_ASC') orderBy = { createdAt: 'asc' };

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;
    if (categoryId) where.categories = { some: { id: categoryId } };
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute query
    const posts = await prisma.post.findMany({
      where,
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
      orderBy,
      take,
      skip,
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      error: 'Failed to fetch posts',
      message: error instanceof Error ? error.message : 'Unknown error',
      // Include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error instanceof Error ? error.stack : undefined 
      }),
    });
  }
});

export default router;
```

## Check Backend Console

Look for these error patterns in your backend terminal:

1. **Prisma errors**: `Invalid 'prisma.post.findMany()' invocation`
2. **Type errors**: `Cannot read property 'X' of undefined`
3. **Database errors**: `P2002`, `P2025`, etc.
4. **Validation errors**: Failed to parse query parameters

The actual error message will tell you exactly what's wrong!

## After Fixing

1. Restart the backend: Stop (Ctrl+C) and run `npm run dev` again
2. Visit: http://localhost:3000/health to check status
3. If green, visit homepage: http://localhost:3000
4. Articles should now load! ✨
