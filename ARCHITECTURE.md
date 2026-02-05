# TruthLens Next.js - Project Structure

```
truthlens-nextjs/
│
├── frontend/                    # Next.js 14 Frontend
│   ├── app/
│   │   ├── globals.css         # Global styles with Tailwind
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── providers.tsx       # React Query & Theme providers
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── AnalysisResults.tsx # Results display
│   │   ├── ForensicRadar.tsx   # Radar chart
│   │   ├── Header.tsx          # App header
│   │   ├── HistorySidebar.tsx  # Analysis history
│   │   ├── ImageUpload.tsx     # Drag-drop upload
│   │   ├── LayerDetails.tsx    # Forensic layer details
│   │   └── SettingsDialog.tsx  # Settings modal
│   │
│   ├── lib/
│   │   ├── api.ts              # API client & types
│   │   └── utils.ts            # Utility functions
│   │
│   ├── next.config.js          # Next.js configuration
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── package.json            # Dependencies
│   └── .env.example            # Environment variables template
│
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze.py      # Image analysis endpoints
│   │   │   ├── history.py      # History endpoints
│   │   │   └── models.py       # Model list endpoints
│   │   │
│   │   ├── core/
│   │   │   └── config.py       # Settings & configuration
│   │   │
│   │   ├── db/
│   │   │   ├── database.py     # SQLAlchemy setup
│   │   │   └── models.py       # Database models
│   │   │
│   │   ├── schemas/
│   │   │   └── analysis.py     # Pydantic schemas
│   │   │
│   │   ├── services/
│   │   │   ├── detector.py     # AI model inference
│   │   │   ├── forensics.py    # 4-layer forensic analysis
│   │   │   └── model_manager.py # Model lifecycle management
│   │   │
│   │   └── main.py             # FastAPI application
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 001_initial.py  # Initial migration
│   │   ├── env.py              # Alembic environment
│   │   └── script.py.mako      # Migration template
│   │
│   ├── tests/
│   │   └── test_api.py         # API tests
│   │
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Production Docker image
│   ├── alembic.ini             # Alembic configuration
│   ├── pytest.ini              # Pytest configuration
│   └── .env.example            # Environment variables template
│
├── docker-compose.yml          # Docker Compose setup
├── .gitignore                  # Git ignore rules
├── .env.example                # Root environment variables
├── README.md                   # Main documentation
├── SETUP.md                    # Quick setup guide
├── setup.bat                   # Windows setup script
└── setup.sh                    # Linux/Mac setup script
```

## Key Components

### Frontend Architecture
- **Next.js 14 App Router** - Modern React framework with server components
- **TypeScript** - Type safety across the application
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **TanStack Query** - Data fetching and caching
- **Zustand** - Global state management
- **Recharts** - Data visualization (radar charts)

### Backend Architecture
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **PyTorch** - Deep learning inference
- **OpenCV** - Image processing
- **Celery** - Background task processing (optional)
- **Redis** - Caching and queue backend

### 4-Layer Detection System

#### Layer 1: Digital Footprint (20% weight)
- **File**: `backend/app/services/forensics.py` → `analyze_digital_footprint()`
- **Checks**: EXIF metadata, resolution patterns, filename analysis
- **AI Keywords**: Midjourney, DALL-E, Stable Diffusion, etc.

#### Layer 2: Pixel Physics (30% weight)
- **File**: `backend/app/services/forensics.py` → `analyze_pixel_physics()`
- **Techniques**: ELA (Error Level Analysis), noise uniformity, color distribution
- **Algorithms**: JPEG recompression diff, local variance, histogram entropy

#### Layer 3: Lighting & Geometry (20% weight)
- **File**: `backend/app/services/forensics.py` → `analyze_lighting_geometry()`
- **Checks**: Edge coherence, dynamic range, gradient analysis
- **Methods**: Canny edge detection, Sobel operators

#### Layer 4: AI Semantic Analysis (30% weight)
- **File**: `backend/app/services/detector.py` → `detect()`
- **Models**: EfficientNet-B7, Xception, ResNet50, Hugging Face models
- **Ensemble**: Voting across multiple models for robustness

### Database Schema

**Table: analyses**
- `id` (String, Primary Key) - UUID
- `filename` (String) - Original filename
- `file_path` (String) - Stored file location
- `thumbnail_url` (String, nullable) - Thumbnail path
- `verdict` (String) - real | suspicious | edited | fake
- `confidence` (Float) - 0.0 to 1.0
- `overall_score` (Float) - 0 to 100
- `digital_footprint` (JSON) - Layer 1 results
- `pixel_physics` (JSON) - Layer 2 results
- `lighting_geometry` (JSON) - Layer 3 results
- `semantic_analysis` (JSON) - Layer 4 results
- `metadata` (JSON) - EXIF and file info
- `processing_time` (Float) - Seconds
- `created_at` (DateTime)
- `updated_at` (DateTime)

### API Endpoints

- `POST /api/analyze` - Analyze image
- `GET /api/analysis/{id}` - Get analysis by ID
- `GET /api/history?limit=20` - Get history
- `GET /api/models` - List available models
- `GET /health` - Health check
- `GET /docs` - Swagger documentation

### Environment Variables

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL (future)

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - JWT secret
- `HUGGINGFACE_TOKEN` - HF API token
- `REPLICATE_TOKEN` - Replicate API token

## Development Workflow

1. **Make changes** to files
2. **Frontend auto-reloads** (Fast Refresh)
3. **Backend auto-reloads** (--reload flag)
4. **Test API** at http://localhost:8000/docs
5. **Run tests**: `pytest` (backend), `npm test` (frontend)
6. **Commit changes** to Git

## Production Deployment

1. **Frontend**: Vercel (automatic from GitHub)
2. **Backend**: Railway, Fly.io, or AWS
3. **Database**: Supabase, Neon, or managed PostgreSQL
4. **Storage**: S3, CloudFlare R2, or local disk

## Performance Optimizations

- **Image Caching**: Redis stores analysis results
- **Model Loading**: Models loaded once at startup
- **Lazy Loading**: Components load on demand
- **Database Indexes**: Created on `created_at` and `verdict`
- **Connection Pooling**: SQLAlchemy manages connections

## Security Features

- **Input Validation**: Pydantic schemas
- **File Type Checking**: Image MIME type validation
- **Size Limits**: 10MB max file size
- **CORS**: Configured allowed origins
- **SQL Injection**: SQLAlchemy ORM protection
- **API Rate Limiting**: (To be implemented)

## Future Enhancements

- [ ] WebSocket for real-time progress
- [ ] User authentication (JWT)
- [ ] Batch processing queue
- [ ] Custom model training
- [ ] API key management
- [ ] Usage analytics dashboard
- [ ] Export reports (PDF)
- [ ] Mobile app (React Native)

---

**Last Updated**: February 5, 2026
