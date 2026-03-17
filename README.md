# AI Stock Prediction (Angular + Backend)

College mini-project: **Stock price history + “AI” next-day close prediction**.

## Tech

- **Frontend**: Angular 15 + Bootstrap + Chart.js  
- **Backend**: Node.js + Express (`backend/`)  
- **Data source**: Yahoo Finance (via `yahoo-finance2`)
- **Model (demo)**: Moving Average

## Run (recommended)

Install dependencies once:

```bash
npm install
cd backend
npm install
```

Start **frontend + backend together**:

```bash
cd ..
npm run dev
```

Open:

- **Frontend**: `http://localhost:4200`
- **Backend health**: `http://localhost:3001/api/health`

## API

- `GET /api/stock/:symbol/history?days=60`
- `POST /api/predict` body:

```json
{ "symbol": "AAPL", "days": 60, "maWindow": 10 }
```
