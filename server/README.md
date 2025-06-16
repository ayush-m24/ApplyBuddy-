# ApplyBuddy Server

Express backend with MongoDB and Razorpay integration.

## Scripts
- `npm start` – run in production mode
- `npm run dev` – run with nodemon

The endpoint `/scrape` forwards job requests to the Python scraper. Configure `SCRAPER_URL` in `.env` if the scraper runs on a different host.

`/api/jobs/scrape` saves scraped jobs to MongoDB. Set `MONGO_URI` in `.env` for database connection.

- Additional job routes:
- `GET /api/jobs` – fetch saved jobs for the logged-in user
- `PATCH /api/jobs/:id/save` – mark a job as saved
- `PATCH /api/jobs/:id/apply` – mark a job as applied
- `POST /api/apply/:jobId` – send application email via Gmail
- `POST /api/payment/order` – create Razorpay order
- `POST /api/payment/verify` – verify payment and activate subscription

Auth routes:
- `POST /api/auth/register` – create account
- `POST /api/auth/login` – login and receive JWT
- `GET /api/auth/me` – fetch current user

Upload CV:
- `POST /api/upload/cv` – authenticated file upload (.pdf or .docx)

Set Gmail credentials in `.env`:
```
GMAIL_CLIENT_ID=xxx
GMAIL_CLIENT_SECRET=xxx
GMAIL_REFRESH_TOKEN=xxx
GMAIL_USER=your@gmail.com
JWT_SECRET=yourSecretKeyHere # IMPORTANT: This should be a long, random, and strong string. You can generate one using a command like `openssl rand -hex 32`. Do not use a weak or easily guessable secret.
MONGO_URI=mongodb://localhost/applybuddy
RAZORPAY_KEY=yourKey
RAZORPAY_SECRET=yourSecret
```
