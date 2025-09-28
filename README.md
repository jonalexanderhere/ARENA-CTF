# 🔥 PHOENIX ARENA CTF Platform

<div align="center">

![GitHub License](https://img.shields.io/github/license/jonalexanderhere/ARENA-CTF)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?logo=next.js&logoWidth=20)](https://nextjs.org)
[![Powered by Prisma](https://img.shields.io/badge/Powered%20by-Prisma-2D3748?logo=prisma&logoWidth=20)](https://www.prisma.io)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css&logoWidth=20)](https://tailwindcss.com)

<img src="https://raw.githubusercontent.com/asynchronous-x/orbital-ctf/refs/heads/main/src/app/favicon.ico" alt="PHOENIX ARENA CTF Logo" width="200"/>

A fire-themed Capture The Flag platform built with modern tech stack that actually Just Works™️ 

Experience epic cyber battles in the PHOENIX ARENA with real-time scoring and team collaboration. Rise from the ashes!

[Report Bug](https://github.com/jonalexanderhere/ARENA-CTF/issues) · [Request Feature](https://github.com/jonalexanderhere/ARENA-CTF/issues)

</div>

## ✨ Features

- 🔐 **User Authentication** - Individual and team registration system
- 🎯 **Challenge Management** - Create, edit, import/export and manage CTF challenges
- 📊 **Real-time Scoring** - Live leaderboard updates
- 🔥 **Phoenix Arena Theme** - Fire-inspired design with stunning visuals for both the categories and challenge selection screens
- 📱 **Responsive Design** - Works on both desktop and mobile
- 🚀 **Modern Stack** - Built with Next.js 15, Prisma, and Tailwind CSS
- 🏁 **Multi-Flag Challenges** - Supports problems with multiple flags for partial credit
- 📈 **Scoreboard History** - Visualize team progress with a dynamic chart
- 🔓 **Unlock Conditions** - Time-based and prerequisite challenge gates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jonalexanderhere/ARENA-CTF.git
   cd ARENA-CTF
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_SECRET="your-secret-here-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   INGEST_CHALLENGES_AT_STARTUP=true
   CHALLENGES_DIR="./challenges"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate reset --force
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏆 Teams & Users

### Admin Accounts
- **phoenix1** - phoenix123 (Admin)
- **phoenix2** - phoenix123 (Admin)
- **phoenix3** - phoenix123 (Admin)
- **phoenix4** - phoenix123 (Admin)
- **phoenix5** - phoenix123 (Admin)

### Team RidhoDatabase
- **ridho_leader** - ridho123 (Team Leader)
- **ridho_member1** - ridho123 (Member)
- **ridho_member2** - ridho123 (Member)

### Team MonokKiller
- **monok_leader** - monok123 (Team Leader)
- **monok_member1** - monok123 (Member)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **3D Graphics**: Three.js with React Three Fiber
- **Charts**: Recharts
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
ARENA-CTF/
├── prisma/                 # Database schema and migrations
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── utils/             # API utilities
├── challenges/            # CTF challenge files
└── public/               # Static assets
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:seed` - Seed database with sample data
- `npm run prisma:generate` - Generate Prisma client

## 🔧 Configuration

### Database
The platform uses SQLite by default for easy setup. For production, consider using PostgreSQL or MySQL.

### Authentication
Configure NextAuth.js providers in `src/lib/auth.ts` for production deployment.

### Challenges
Place challenge files in the `challenges/` directory. The platform supports:
- Text files
- Images
- Archives
- Any file type

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
docker build -t arena-ctf .
docker run -p 3000:3000 arena-ctf
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original [Orbital CTF](https://github.com/asynchronous-x/orbital-ctf) project
- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Tailwind CSS for the utility-first CSS framework

---

<div align="center">
  <strong>🔥 Rise to the challenge in the PHOENIX ARENA! 🔥</strong>
</div>