# 🚀 PHOENIX ARENA CTF - Vercel Deployment Guide

## 📋 Prerequisites

- GitHub account
- Vercel account
- PostgreSQL database (recommended: Neon, Supabase, or PlanetScale)

## 🔧 Step-by-Step Deployment

### 1. Database Setup

#### Option A: Neon (Recommended)
1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use format: `postgresql://username:password@host:port/database?sslmode=require`

#### Option B: Supabase
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

#### Option C: PlanetScale
1. Go to [PlanetScale](https://planetscale.com)
2. Create a new database
3. Copy the connection string

### 2. Vercel Deployment

#### Method 1: GitHub Integration (Recommended)
1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/jonalexanderhere/ARENA-CTF.git
   cd ARENA-CTF
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_SECRET=your_random_secret_key_here
   NEXTAUTH_URL=https://your-app-name.vercel.app
   INGEST_CHALLENGES_AT_STARTUP=true
   CHALLENGES_DIR=./challenges
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

#### Method 2: Vercel CLI
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

### 3. Database Migration

After deployment, run the database setup:

```bash
# Using Vercel CLI
vercel exec "npm run vercel:setup"

# Or using the Vercel dashboard
# Go to Functions tab and run the setup function
```

### 4. Verify Deployment

1. **Check Application**
   - Visit your Vercel URL
   - Test login with admin credentials
   - Verify all features work

2. **Test Database**
   - Login as admin
   - Check teams and challenges
   - Verify real-time updates

## 🔐 Default Credentials

### Admin Accounts
- **phoenix1** - phoenix123
- **phoenix2** - phoenix123
- **phoenix3** - phoenix123
- **phoenix4** - phoenix123
- **phoenix5** - phoenix123

### Team Accounts
- **RidhoDatabase**: ridho_leader, ridho_member1, ridho_member2
- **MonokKiller**: monok_leader, monok_member1

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Ensure database is accessible
   - Verify SSL settings

2. **Build Errors**
   - Check Prisma client generation
   - Verify all dependencies installed
   - Check for TypeScript errors

3. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches domain
   - Ensure cookies are enabled

### Performance Optimization

1. **Database Indexing**
   - Add indexes for frequently queried fields
   - Use connection pooling
   - Monitor query performance

2. **Caching**
   - Enable Vercel Edge caching
   - Use Redis for session storage
   - Implement API response caching

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics
- Monitor performance metrics
- Track user engagement

### Database Monitoring
- Set up database monitoring
- Monitor connection usage
- Track query performance

## 🔄 Updates and Maintenance

### Regular Updates
1. **Dependencies**
   ```bash
   npm update
   ```

2. **Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Redeploy**
   ```bash
   vercel --prod
   ```

### Backup Strategy
1. **Database Backups**
   - Set up automated backups
   - Store backups securely
   - Test restore procedures

2. **Code Backups**
   - Use Git for version control
   - Create release tags
   - Maintain deployment history

## 🎯 Production Checklist

- [ ] Database configured and migrated
- [ ] Environment variables set
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Analytics enabled
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Documentation updated

## 🆘 Support

If you encounter issues:

1. **Check Vercel Logs**
   - Go to Functions tab
   - Check deployment logs
   - Look for error messages

2. **Database Issues**
   - Check connection string
   - Verify database permissions
   - Test connection locally

3. **Application Issues**
   - Check browser console
   - Verify environment variables
   - Test API endpoints

---

**🔥 PHOENIX ARENA CTF - Ready for Production! 🔥**
