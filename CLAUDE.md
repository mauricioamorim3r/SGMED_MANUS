# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **SGM (Sistema de Gerenciamento Metrológico)** - a comprehensive Metrological Management System for the oil and gas industry. The system manages measurement equipment, chemical analyses, stock control, and regulatory compliance.

### Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS + Shadcn/ui components
- **Backend**: Dual server setup (Node.js/Express + Python/Flask)
- **Database**: SQLite with 17 tables and 557 unique fields
- **UI Framework**: Shadcn/ui components with Lucide React icons

## Development Commands

### Starting the Application

**Backend Servers:**
```bash
# Primary Node.js/Express server (port 3001)
node server.js

# Alternative simplified server
node server-simple.js

# Python/Flask server (port 5000)
python app.py
```

**Frontend (React + Vite):**
```bash
# Install dependencies first
npm install

# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Testing

```bash
# Complete API test suite (tests 17 modules)
node test_apis_completo.js

# Database initialization test
node test_database_init.js

# Module-specific tests
node test_parte4_completa.js  # Management modules
node test_parte5_completa.js  # System modules
node test_sync.js             # Synchronization tests
```

### Dependencies Installation

```bash
# Python dependencies
pip install -r requirements.txt

# Node.js dependencies
npm install
```

## Code Architecture

### Frontend Structure

**Project Structure:**
```
/src/
├── components/
│   ├── ui/ - Shadcn/ui components (Button, Card, etc.)
│   └── lib/ - Utility functions (cn, utils)
├── App.jsx - Main application component
├── index.css - Tailwind CSS with design tokens
└── [Module].jsx - Individual feature components
```

**Key Files:**
- `main.jsx` - React app bootstrap
- `src/App.jsx` - Main application with routing and layout
- `vite.config.js` - Vite configuration with @ aliases
- `package.json` - Complete dependency list
- `tailwind.config.js` - Tailwind CSS configuration

**Key Patterns:**
- Functional components with hooks
- Single-page application with module navigation
- Shadcn/ui component library with @/components/ui/ imports
- Tailwind CSS for styling
- Backend API calls to both Express (port 3001) and Flask (port 5000) servers

### Backend Structure

**Express Server (`server.js`):**
- RESTful API with 17 module endpoints
- Routes in `/routes/` directory
- Services in `/services/` directory
- Database models and initialization

**Flask Server (`app.py`):**
- Alternative API implementation
- Demo data endpoints
- Production deployment ready

**Database:**
- SQLite database in `/data/sgm.db`
- 17 tables with complex relationships
- Models defined in individual `.js` files

### Key Modules (17 total)

1. **Core Modules**: Equipamentos, Polos, Instalações, Pontos de Medição
2. **Specialized**: Placas de Orifício, Incertezas, Trechos Retos
3. **Advanced**: Testes de Poços, Análises Químicas
4. **Management**: Estoque, Movimentação, Controle de Mudanças
5. **System**: Usuários, Sessões, Auditoria, Configurações

### API Endpoints

All APIs follow RESTful patterns:
```
GET /api/health              - Health check
GET /api/info               - System information
GET /api/{module}           - List records
POST /api/{module}          - Create record
PUT /api/{module}/:id       - Update record
DELETE /api/{module}/:id    - Delete record
```

**Key endpoints:**
- `/api/equipamentos` - Equipment management
- `/api/polos` - Poles/sites management  
- `/api/analises-quimicas` - Chemical analyses
- `/api/estoque` - Stock control
- `/api/testes-pocos` - Well testing
- `/api/configuracoes` - System configuration

## Development Guidelines

### Testing Approach
- Use existing test files in root directory
- `test_apis_completo.js` provides comprehensive coverage
- Tests validate 94.4% success rate across all modules

### Code Patterns
- Components use Shadcn/ui patterns
- Backend follows Express.js conventions
- Database models use Sequelize-like patterns
- Error handling with try/catch and proper HTTP status codes

### Security Implementation
- JWT authentication
- bcrypt password hashing
- CORS configuration
- Helmet security headers
- Session management with expiration

### Performance Considerations
- Database queries optimized with indices
- Compression middleware enabled
- Response time logging
- Graceful server shutdown handling

## File Organization

**Frontend Components:**
- `App-*.jsx` - Different app configurations
- `{Module}.jsx` - Individual module components
- `AuthContext.jsx` - Authentication context
- `Layout.jsx`, `Header.jsx`, `Sidebar.jsx` - Layout components

**Backend Files:**
- `server.js` - Main Express server
- `app.py` - Flask server alternative
- `config.js` - Database configuration
- `init.js` - Database initialization
- `{module}.js` - Individual module models/routes

**Testing Files:**
- `test_apis_completo.js` - Complete API testing
- `test_*.js` - Module-specific tests

## Regulatory Compliance

The system implements compliance with:
- **ISO 5167** - Flow measurement with orifice plates
- **AGA-3** - Natural gas measurement
- **ANP** - Brazilian petroleum agency standards
- **API MPMS** - Petroleum measurement standards
- **Inmetro** - Brazilian metrology standards

## Production Deployment

The system is production-ready with:
- Permanent backend URL: `https://nghki1cl06l9.manus.space`
- 94.4% test success rate
- 17 functional modules
- Complete audit trail and security implementation
- 7-year data retention for regulatory compliance