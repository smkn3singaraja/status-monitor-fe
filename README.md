# Status Monitor - Frontend

Modern Next.js 16 frontend for the Status Monitor application with server-side rendering and beautiful UI.

## Features

- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 📊 **Interactive Charts**: Real-time visualizations using Recharts
- 🚀 **Server-Side Rendering**: Fast initial page loads with Next.js App Router
- 📱 **Responsive Design**: Mobile-first approach, works on all devices
- 🔄 **Real-time Updates**: Auto-refreshing status dashboard
- 📈 **Historical Analysis**: View performance trends over time

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your backend URL
# NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Development

```bash
# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
app/
├── layout.tsx              # Root layout with navigation
├── page.tsx                # Homepage (latest status dashboard)
├── historical/
│   └── page.tsx            # Historical data page
└── globals.css             # Global styles

src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── navigation.tsx      # App navigation
│   ├── status-card.tsx     # Service status card
│   ├── status-grid.tsx     # Grid layout for status cards
│   └── historical-chart.tsx # Time-series charts
└── lib/
    ├── api.ts              # Backend API client
    ├── types.ts            # TypeScript types
    └── utils.ts            # Utility functions
```

## Pages

### Home Page (`/`)
- Real-time status dashboard
- Summary statistics (uptime, services online/offline)
- Grid of service status cards
- Server-side rendered for optimal performance

### Historical Data (`/historical`)
- Service selector dropdown
- Date range picker (24h, 7d, 30d, 90d)
- Performance statistics cards
- Interactive charts:
  - Response time line chart
  - Uptime/downtime area chart

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

## Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your Git repository

2. **Configure Build**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL` with your production backend URL

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Customization

### Colors & Theme

Edit `tailwind.config.ts` and `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: YOUR_COLOR;
  --background: YOUR_COLOR;
  /* ... */
}
```

### Dashboard Refresh Rate

The homepage auto-revalidates. To change the refresh interval, edit `app/page.tsx`:

```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```

## Development Tips

### Adding New Components

1. Create component in `src/components/`
2. Use TypeScript for type safety
3. Follow the existing component patterns
4. Use `cn()` utility for class merging

### API Integration

All API calls are centralized in `src/lib/api.ts`:

```typescript
import { getLatestStatus, getHistoricalStatus } from '@/lib/api';
```

## Performance

- Server-side rendering for fast initial loads
- Optimized bundle size with Next.js 16
- Automatic code splitting
- Image optimization
- Font optimization with next/font

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
