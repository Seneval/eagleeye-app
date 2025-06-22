# Deployment Guide for EagleEye

## Deploying to Vercel

### Prerequisites
1. GitHub repository with your code
2. Vercel account (free at vercel.com)
3. Environment variables ready

### Step-by-Step Deployment

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `web` directory as root directory

3. **Configure Environment Variables**
   Add these in Vercel's Environment Variables section:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_value_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value_here
   OPENAI_API_KEY=your_value_here
   NEXT_PUBLIC_SENTRY_DSN=your_value_here
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `your-project.vercel.app`

### Post-Deployment Checklist

- [ ] Test authentication (login/logout)
- [ ] Create a test task
- [ ] Test AI assistants
- [ ] Check Sentry is receiving errors
- [ ] Test on mobile devices

### Custom Domain (Optional)

In Vercel dashboard:
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Important Notes

- **Free tier limits**: 100GB bandwidth/month, perfect for beta testing
- **API timeout**: 10 seconds on free tier (we configured 30s for AI)
- **Concurrent builds**: 1 on free tier

### Sharing with Beta Testers

Once deployed, share:
- URL: `https://your-app.vercel.app`
- Ask them to sign up with email
- Monitor errors in Sentry dashboard

### Updating the App

Any push to `main` branch will trigger automatic deployment!

```bash
git add .
git commit -m "Update features"
git push origin main
```