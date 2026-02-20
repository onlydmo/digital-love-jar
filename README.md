# Digital Love Jar 💖

A secure, intimate digital space for couples to share memories, notes, and moments. Built with privacy and emotional connection at its core.

![Project Banner](/public/icon.png)

## ✨ Features

- **The Secret Portal**: A magical, animated login experience protected by a shared secret.
- **Digital Jar**: Folded notes that must be tapped to reveal, creating a ritual of "opening" memories.
- **End-to-End Privacy**: 
    - **Anonymous Auth**: No emails or passwords required.
    - **Row Level Security (RLS)**: Your data is physically isolated from others in the database.
- **Dynamic Ambience**: Switch between Night, Sunset, and Rain themes.
- **Rich Media**: Share photos and Spotify songs directly in your notes.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend / DB**: Supabase (PostgreSQL, Realtime, Storage)
- **Security**: Supabase Auth (Anonymous), RLS Policies, pgcrypto hashing
- **Deployment**: Vercel

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/digital-love-jar.git
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## 🔒 Security

This project takes security seriously, even for a "fun" app.

- **Authentication**: Users are authenticated anonymously via Supabase Auth.
- **Authorization**: RLS policies ensure you can *only* access data explicitly linked to your couple ID.
- **Headers**: STRICT-TRANSPORT-SECURITY, CONTENT-SECURITY-POLICY, and X-FRAME-OPTIONS are enforced via `vercel.json`.

## 📄 License

MIT License. Designed with love.
