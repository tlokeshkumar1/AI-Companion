# AI Companion

A full-stack web application that allows users to create, customize, and chat with AI-powered bots. Each bot has unique personalities, backstories, and conversation styles, providing personalized AI companions for various purposes.

## 🌟 Features

- **User Authentication**: Secure signup/login with email verification via OTP
- **Bot Creation**: Create custom AI bots with unique personalities and characteristics
- **Real-time Chat**: Interactive conversations with AI companions
- **Bot Customization**: Detailed bot configuration including personality, backstory, and conversation style
- **Avatar Support**: Upload and manage bot avatars
- **Privacy Controls**: Public and private bot visibility settings
- **Responsive Design**: Modern, mobile-friendly interface

## 🚀 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | REST API framework |
| **MongoDB** | NoSQL database |
| **Google Gemini API** | AI conversation engine |
| **Gmail API** | Email notifications and OTP |
| **Motor** | Async MongoDB driver |
| **BCrypt** | Password hashing |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **React Router** | Client-side routing |
| **Tailwind CSS** | Styling framework |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

## 📁 Project Structure

```
AI Companion/
├── backend/                    # FastAPI backend
│   ├── main.py                # Entry point
│   ├── requirements.txt       # Python dependencies
│   ├── routers/              # API route handlers
│   │   ├── auth.py           # Authentication routes
│   │   ├── bots.py           # Bot management routes
│   │   └── chat.py           # Chat functionality routes
│   └── utils/                # Utility modules
│       ├── gmail_utils.py    # Email service utilities
│       ├── hashing.py        # Password hashing utilities
│       └── langchain_utils.py # AI conversation utilities
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API service layer
│   │   └── types/           # TypeScript type definitions
│   ├── package.json         # Node.js dependencies
│   └── vite.config.ts       # Vite configuration
└── README.md               # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **Google Cloud Console** account (for Gemini and Gmail APIs)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tlokeshkumar1/AI-Companion
   cd AI\ Companion/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=ai_companion
   GOOGLE_API_KEY=your_gemini_api_key_here
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

5. **Gmail API Setup** (for email verification)
   - Create a project in Google Cloud Console
   - Enable Gmail API
   - Create OAuth2 credentials
   - Download credentials and save as `credentials.json`
   - Run the token generation script:
     ```bash
     python generate_token.py
     ```

6. **Start the backend server**
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `MONGODB_DB_NAME` | Database name | ✅ |
| `GOOGLE_API_KEY` | Google Gemini API key | ✅ |
| `JWT_SECRET_KEY` | JWT secret key | ✅ |

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | User registration |
| POST | `/auth/login` | User login |
| POST | `/auth/verify-otp` | Email verification |
| POST | `/auth/resend-otp` | Resend verification code |

#### Bot Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bots/createbot` | Create new bot |
| GET | `/bots/getbots/{user_id}` | Get user's bots |
| GET | `/bots/getpublicbots` | Get public bots |
| PUT | `/bots/updatebot/{bot_id}` | Update bot details |
| DELETE | `/bots/deletebot/{bot_id}` | Delete bot |

#### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/ask` | Send message to bot |
| GET | `/chat/history/{chat_id}` | Get chat history |

## 🎯 Usage

### Creating Your First Bot

1. **Sign up** for a new account
2. **Verify** your email with the OTP sent
3. **Log in** to your account
4. **Navigate** to the "Create Bot" page
5. **Fill in** bot details:
   - Name and bio
   - Personality traits
   - Backstory
   - Conversation style
   - Bot type and privacy settings
6. **Upload** an avatar (optional)
7. **Save** your bot

### Chatting with Bots

1. **Browse** available bots on the dashboard
2. **Click** on a bot to start chatting
3. **Send** messages and receive AI-generated responses
4. **View** chat history and continue conversations

## 🔒 Security Features

- **Password Hashing**: Secure password storage using BCrypt
- **Email Verification**: OTP-based account verification
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation using Pydantic models
- **Privacy Controls**: User-defined bot visibility settings

## 🚀 Deployment

### Backend Deployment

1. **Configure production environment variables**
2. **Set up MongoDB Atlas** (recommended for production)
3. **Deploy to your preferred platform** (Heroku, AWS, GCP, etc.)
4. **Update CORS origins** for your frontend domain

### Frontend Deployment

1. **Build the production bundle**
   ```bash
   npm run build
   ```
2. **Deploy to static hosting** (Vercel, Netlify, etc.)
3. **Update API base URL** in the frontend configuration
