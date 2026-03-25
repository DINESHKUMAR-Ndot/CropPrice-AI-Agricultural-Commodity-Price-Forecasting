# CropPrice AI - Agricultural Commodity Price Forecasting

A machine learning-powered web application for predicting agricultural commodity prices in India.

## Features

- **Price Prediction**: Predict prices for Wheat, Rice, and Corn based on quantity
- **Real-time Metrics**: Dynamic model performance metrics (R², MAE, RMSE)
- **Model Retraining**: Retrain the model on-demand with latest data
- **Interactive Charts**: Historical price trends visualization
- **Indian Rupee (₹)**: Prices displayed per quintal (100 kg)

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **scikit-learn** - Random Forest Regressor model
- **pandas/numpy** - Data processing

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Axios** - API calls

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI endpoints
│   ├── model_service.py     # ML model logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   └── components/      # UI components
│   └── package.json         # Node dependencies
├── dataset/
│   ├── raw_data/            # Original data
│   └── processed_data/      # Cleaned data (240 records)
├── notebooks/               # Jupyter notebooks for analysis
├── outputs/
│   └── graphs/              # Visualizations
└── src/                     # Python utility scripts
```

## Setup & Run

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict` | POST | Predict commodity price |
| `/commodities` | GET | List available commodities |
| `/model-info` | GET | Get model metrics |
| `/retrain` | POST | Retrain the model |
| `/historical` | GET | Get historical data |
| `/health` | GET | Health check |

## Model Performance

- **Algorithm**: Random Forest Regressor (100 trees)
- **R² Score**: ~99.7%
- **MAE**: ~₹40 per quintal
- **Training Data**: 240 records (2023-2024)

## Jupyter Notebooks

1. **data_understanding.ipynb** - EDA and data exploration
2. **preprocessing.ipynb** - Data cleaning and preprocessing
3. **visualization.ipynb** - Data visualizations

---
Built with Python & React
