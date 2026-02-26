# Shusto - Deployment Guide for shusto.com

## Prerequisites

1. **Vercel Account** - Create one at https://vercel.com
2. **GitHub Repository** - Push your code to GitHub
3. **Supabase Project** - Already configured with tables and RLS policies
4. **Custom Domain** - shusto.com connected to your Vercel project

---

## Step 1: Connect GitHub Repository to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Import"

---

## Step 2: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### SSLCommerz Payment Gateway (Sandbox)
```
SSLCOMMERZ_STORE_ID=shust6992a1e590b0e
SSLCOMMERZ_STORE_PASSWORD=6e7a0efbf62b1d6e27e29dd77d73
```

### Application URL
```
NEXT_PUBLIC_SITE_URL=https://shusto.com
```

---

## Step 3: Configure Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Add your domain: `shusto.com`
3. Follow DNS configuration instructions:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel Nameservers

---

## Step 4: Deploy

### Option A: Automatic Deployment (Recommended)
- Every push to `main` branch auto-deploys
- Vercel will run build and tests automatically

### Option B: Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Verify deployment
vercel env list
```

---

## Step 5: Verify Deployment

1. Visit https://shusto.com
2. Check console for errors (F12)
3. Test login flow with test credentials
4. Test payment gateway (Sandbox mode)

---

## Troubleshooting

### Build Errors

**Error: "Invalid Project Settings"**
- Delete `vercel.json` if it exists
- Check `next.config.mjs` syntax
- Verify all env variables are set

**Solution:**
```bash
rm vercel.json
git add .
git commit -m "Remove vercel.json"
git push origin main
```

### CLI Issues

**Error: "Vercel CLI not authenticated"**
```bash
vercel login
vercel link
vercel env pull
```

**Error: "Project not found"**
```bash
vercel link --project=shusto
```

### Missing Environment Variables

**Error: "Cannot read property of undefined"**
1. Go to Vercel Settings → Environment Variables
2. Add all missing variables
3. Trigger new deployment: `vercel --prod`

---

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Custom domain configured and verified
- [ ] SSL certificate auto-generated (Vercel handles this)
- [ ] Supabase RLS policies enabled
- [ ] SSLCommerz credentials updated (if using production)
- [ ] Analytics dashboard configured
- [ ] Error tracking set up
- [ ] Database backups enabled in Supabase

---

## Update SSLCommerz for Production

When ready for production:

1. Get production credentials from SSLCommerz
2. Update in Vercel environment variables:
   ```
   SSLCOMMERZ_STORE_ID=your_production_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_production_password
   ```
3. Update Supabase URLs if needed
4. Deploy: `vercel --prod`

---

## Monitoring & Maintenance

- **Monitor Logs**: `vercel logs shusto --prod`
- **Check Analytics**: Vercel Dashboard → Analytics
- **Database**: Supabase Dashboard → Monitoring
- **Performance**: Vercel Dashboard → Performance

---

## Support

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Documentation: https://nextjs.org/docs
