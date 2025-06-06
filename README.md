# ApplyBuddy

Full-stack job automation platform for Indian job seekers.

```
applybuddy/
├── client/   # React + Tailwind frontend
├── server/   # Node.js + Express backend
├── scraper/  # Python job scraper API
```

Each folder contains a README with setup instructions. The scraper now exposes an HTTP API that the Node backend consumes.
The backend uses the Gmail API to send applications for jobs that expose recruiter emails.
Users authenticate with JWT and can upload their CV which is required for sending applications.
The React client includes a subscribe page at `/subscribe` which opens Razorpay Checkout to activate a user subscription.

## Running locally

Start the backend API:

```bash
cd server
npm install
npm run dev
```

This launches Express on [http://localhost:5000](http://localhost:5000).

In another terminal, start the React development server:

```bash
cd client
npm install
npm run dev
```

Vite prints the URL to open in your browser, typically
[http://localhost:5173](http://localhost:5173). If that port is taken it will
increment (5174, 5175, ...). Use the port shown in the terminal.
