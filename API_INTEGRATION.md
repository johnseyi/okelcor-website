# Okelcor — API Integration Guide

## Local Development
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000/api/v1`

## Environment Setup
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
For production change to:
```env
NEXT_PUBLIC_API_URL=https://api.okelcor.de/api/v1
```

## Available Endpoints

### Public (no auth needed)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | All products (supports `?type=PCR&brand=Michelin&locale=en`) |
| GET | `/products/{id}` | Single product |
| GET | `/categories?locale=en` | All 4 tyre categories |
| GET | `/hero-slides?locale=en` | Homepage hero slides |
| GET | `/brands` | Tyre brands |
| GET | `/articles?locale=en` | All articles |
| GET | `/articles/{slug}?locale=en` | Single article |
| GET | `/settings` | Site-wide settings |
| GET | `/search?q=michelin` | Search products & articles |
| POST | `/quote-requests` | Submit quote form |
| POST | `/contact` | Submit contact form |
| POST | `/orders` | Submit checkout order |
| POST | `/newsletter/subscribe` | Newsletter signup |

### Locale Parameter
Pass `?locale=en`, `?locale=de`, or `?locale=fr` on all
content endpoints. Defaults to `en` if omitted.

## Response Format
All endpoints return:
```json
{
  "data": { },
  "meta": { },
  "message": ""
}
```

## Image URLs
All image URLs from the API are absolute:
- Local: `http://localhost:8000/storage/...`
- Production: `https://api.okelcor.de/storage/...`

Add to `next.config.ts`:
```ts
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
      pathname: '/storage/**'
    },
    {
      protocol: 'https',
      hostname: 'api.okelcor.de',
      pathname: '/storage/**'
    }
  ]
}
```

## CORS
The backend already allows `http://localhost:3000`.
No extra configuration needed on the frontend.

## Integration Priority Order
Replace static data files in this order:
1. Hero Slides — homepage slider
2. Categories — homepage carousel
3. Brands — trusted brands section
4. Products — shop catalogue & product pages
5. Articles — news & insights
6. Quote form — /quote page
7. Contact form — /contact page
8. Orders — /checkout page
9. Newsletter — newsletter strip
10. Search — search functionality