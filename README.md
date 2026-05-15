# Uttar Pradesh Police Feedback Portal 🚔

A full-stack feedback management system designed for the Uttar Pradesh Police to gather structured citizen feedback on various services.

## ✨ Features
- **Professional Branding**: UP Police theme with official colors and logo support.
- **Structured Feedback**: Rate services like Police Station Visit, UP 112, Passport Verification, etc.
- **Star Rating System**: Intuitive UI for rating Behavior, Time, and Cleanliness.
- **Bilingual Support**: Toggle between Hindi and English.
- **Admin Dashboard**: Secure view for administrators to monitor and analyze feedback.
- **Supabase Integration**: Robust PostgreSQL database for data persistence.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend**: Node.js, Express.js.
- **Database**: Supabase (PostgreSQL) with Drizzle ORM.
- **Icons**: Font Awesome.

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/UP-Police-Feedback-Portal.git
cd UP-Police-Feedback-Portal
```

### 2. Setup Backend
1. Go to the `Backend` folder: `cd Backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` and add your `DATABASE_URL` and `JWT_SECRET`.
4. Run migrations: `npm run db:push`
5. Start server: `npm run dev`

### 3. Setup Frontend
1. Open `Frontend/index.html` in your browser (using Live Server).
2. Ensure the `BACKEND_BASE_URL` in `script.js` matches your local server address.

## 🔒 Security Note
Do not share your `.env` file. It contains sensitive database credentials.

---
Created for the community to improve public service transparency.
