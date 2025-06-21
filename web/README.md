# EagleEye - Smart Productivity SaaS

AI-powered productivity assistant for SME owners and freelancers.

## 🚀 Features

### Free Tier
- **Daily Todo Management** with AI prioritization
- **Weekly/Monthly Goals** with visual progress tracking
- **Business Context** capture for personalized AI advice
- **AI Assistant (Alex)** for productivity coaching
- **Marketing Bot (Maya)** for strategy development

### Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI**: OpenAI GPT-4
- **Monitoring**: Sentry
- **Payments**: Stripe (ready for paid tier)

## 🛠 Setup

1. **Clone and install:**
```bash
cd web
npm install
```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in the SQL editor
   - Copy your project URL and anon key

3. **Configure environment variables:**
   Update `.env.local` with your keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server:**
```bash
npm run dev
```

Visit http://localhost:3000

## 🎨 Unique UI Features

- **Time-based gradient background** that changes throughout the day
- **Priority Compass** for AI-powered task prioritization
- **Goal Thermometer** with liquid animation
- **Swoosh animations** when completing tasks
- **Glassmorphism design** with custom styling

## 📁 Project Structure

```
app/
├── (auth)/          # Authentication pages
├── dashboard/       # Main app pages
│   ├── todos/
│   ├── goals/
│   └── context/
├── ai/             # AI bot interfaces
│   ├── assistant/
│   └── marketing/
└── api/            # API routes
    ├── todos/
    ├── goals/
    └── ai/[bot]/
```

## 🔒 Security

- Supabase Row Level Security (RLS) enabled
- Users can only access their own data
- API keys stored in environment variables
- Sentry monitoring for error tracking

## 🚦 Next Steps

1. Add Stripe integration for paid tiers
2. Implement additional AI bots (ads, design, accounting)
3. Add voice input for todos
4. Create mobile app version
5. Add team collaboration features