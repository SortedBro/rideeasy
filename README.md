# 🚲 RideEasy – Complete Bike Rental Service

A production-ready, full-stack bike rental platform built with Node.js, Express, EJS, and MongoDB.

---

## 📁 Folder Structure

```
bikerental/
├── config/
│   └── db.js                   # MongoDB connection
├── controllers/
│   ├── authController.js       # Register, login, OTP
│   ├── bikeController.js       # Browse, detail, reviews
│   ├── bookingController.js    # Create, cancel, detail
│   ├── paymentController.js    # Razorpay + COD
│   ├── userController.js       # Dashboard, profile
│   └── adminController.js      # Admin panel
├── middleware/
│   └── auth.js                 # JWT + session guards
├── models/
│   ├── User.js
│   ├── Bike.js
│   ├── Booking.js
│   └── Contact.js
├── routes/
│   ├── index.js                # Home, About, FAQ, Contact
│   ├── auth.js
│   ├── bikes.js
│   ├── booking.js
│   ├── payment.js
│   ├── user.js
│   ├── admin.js
│   └── api.js                  # REST API endpoints
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   ├── images/
│   └── uploads/                # Bike images (auto-created)
├── utils/
│   └── mailer.js               # Brevo SMTP email
├── views/
│   ├── partials/               # header.ejs, footer.ejs
│   ├── auth/                   # register, login, verify-otp
│   ├── bikes/                  # list, detail
│   ├── booking/                # form, detail
│   ├── payment/                # checkout
│   ├── user/                   # dashboard, bookings, profile
│   ├── admin/                  # dashboard, bikes, bookings, users, contacts
│   ├── index.ejs               # Homepage
│   ├── about.ejs
│   ├── faq.ejs
│   ├── contact.ejs
│   ├── 404.ejs
│   └── 500.ejs
├── .env
├── seed.js                     # Database seeder
├── server.js                   # Entry point
└── package.json
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
cd bikerental
npm install
```

### 2. Configure environment
The `.env` file is already configured with your credentials. Verify it contains:
```
PORT=4000
MONGODB_URI=your_atlas_uri
JWT_SECRET=your_secret
BREVO_USER=your_brevo_user
BREVO_PASS=your_brevo_pass
MAIL_FROM=your_email
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### 3. Seed the database
```bash
node seed.js
```
This creates:
- **Admin account**: `admin@rideeasy.in` / `admin123`
- **12 sample bikes** across 8 cities

### 4. Start the server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

### 5. Open the app
```
http://localhost:4000
```

---

## 🔑 Default Credentials

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@rideeasy.in    | admin123   |
| User  | Register via /auth/register |

---

## 🌐 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Homepage |
| GET | `/bikes` | List bikes (with filters) |
| GET | `/bikes/:id` | Bike detail |
| GET | `/about` | About page |
| GET | `/faq` | FAQ page |
| GET | `/contact` | Contact page |
| POST | `/contact` | Submit contact form |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/auth/register` | User registration |
| GET/POST | `/auth/login` | Login with password |
| POST | `/auth/send-otp` | OTP login request |
| GET/POST | `/auth/verify-otp` | Verify OTP |
| GET | `/auth/logout` | Logout |

### Bikes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bikes?city=&type=&minPrice=&maxPrice=&sort=&q=` | Filtered bike list |
| GET | `/bikes/:id` | Bike detail page |
| POST | `/bikes/:id/review` | Submit review (auth required) |

### Booking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/booking/new/:bikeId` | Booking form |
| POST | `/booking/create` | Create booking |
| GET | `/booking/:id` | Booking detail |
| POST | `/booking/:id/cancel` | Cancel booking |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payment/checkout/:bookingId` | Checkout page |
| POST | `/payment/create-order/:bookingId` | Create Razorpay order |
| POST | `/payment/verify` | Verify Razorpay payment |
| POST | `/payment/cod/:bookingId` | Cash on delivery |

### User Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/dashboard` | User dashboard |
| GET | `/user/bookings` | Booking history |
| GET | `/user/profile` | Profile page |
| POST | `/user/profile/update` | Update profile |
| POST | `/user/profile/password` | Change password |

### Admin Panel
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Analytics dashboard |
| GET | `/admin/bikes` | List all bikes |
| GET | `/admin/bikes/add` | Add bike form |
| POST | `/admin/bikes/add` | Create bike |
| GET | `/admin/bikes/:id/edit` | Edit bike form |
| POST | `/admin/bikes/:id/edit` | Update bike |
| POST | `/admin/bikes/:id/delete` | Delete bike |
| GET | `/admin/bookings` | All bookings |
| POST | `/admin/bookings/:id/status` | Update booking status |
| GET | `/admin/users` | All users |
| GET | `/admin/contacts` | Contact messages |
| POST | `/admin/contacts/:id/replied` | Mark replied |

### REST API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/availability/:bikeId?start=&end=` | Real-time availability |
| GET | `/api/search?q=` | Bike autocomplete search |
| GET | `/api/cities` | List all cities |

---

## ✨ Features

- **Authentication**: Email/password + OTP login via Brevo SMTP
- **Bike Browsing**: Filter by city, type, price range, availability; sort options
- **Real-time Availability**: Instant conflict detection via API
- **Booking System**: Hourly & daily rental, live price calculator
- **Payments**: Razorpay online + Cash on Delivery
- **Email Notifications**: OTP + booking confirmation emails
- **Reviews & Ratings**: Star ratings with text comments
- **User Dashboard**: Booking history, profile management
- **Admin Panel**: Full CRUD for bikes, booking management, analytics
- **Responsive Design**: Mobile-first, works on all screen sizes

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | EJS, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + Express Session |
| Email | Nodemailer + Brevo SMTP |
| Payments | Razorpay |
| File Upload | Multer |

---

## 📧 Email Setup (Brevo)

The app uses your Brevo SMTP credentials. Emails sent:
1. **OTP Verification** – on registration and OTP login
2. **Booking Confirmation** – after successful payment

---

## 💳 Razorpay Test Mode

For testing payments without real charges:
1. Switch `RAZORPAY_KEY_ID` to test key (`rzp_test_...`)
2. Use test card: `4111 1111 1111 1111`, CVV: `123`, Expiry: any future date

---

## 🚀 Deployment

This app is ready to deploy on **Railway**, **Render**, or **Heroku**:

```bash
# Set environment variables in your hosting dashboard
# Start command:
npm start
```

The `uploads/` directory is auto-created on first start.
