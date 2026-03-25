"""
Model Service - ML model loading and prediction
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import os

# Commodity encoding
COMMODITY_ENCODING = {
    'Corn': 0,
    'Rice': 1,
    'Wheat': 2
}

COMMODITY_DECODING = {v: k for k, v in COMMODITY_ENCODING.items()}

class CropPriceModel:
    def __init__(self):
        self.model = None
        self.metrics = {}
        self.is_trained = False
        self.training_info = {}  # Store training details

    def load_data(self):
        """Load the processed dataset"""
        # Get the path relative to this file
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_path = os.path.join(base_dir, 'dataset', 'processed_data', 'cleaned_data.csv')

        df = pd.read_csv(data_path)
        df['Date'] = pd.to_datetime(df['Date'])
        return df

    def train(self):
        """Train the Random Forest model"""
        import time
        start_time = time.time()

        print("Loading data and training model...")
        df = self.load_data()

        # Store dataset info
        self.training_info = {
            'total_records': len(df),
            'date_range': {
                'start': df['Date'].min().strftime('%Y-%m-%d'),
                'end': df['Date'].max().strftime('%Y-%m-%d')
            },
            'commodities_count': df['Commodity'].nunique()
        }

        # Prepare features and target
        X = df[['Quantity', 'Commodity']]
        y = df['Modal Price']

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2
        )

        self.training_info['train_size'] = len(X_train)
        self.training_info['test_size'] = len(X_test)

        # Train Random Forest
        self.model = RandomForestRegressor(n_estimators=100)
        self.model.fit(X_train, y_train)

        # Calculate metrics
        y_pred = self.model.predict(X_test)
        self.metrics = {
            'mae': round(mean_absolute_error(y_test, y_pred), 2),
            'rmse': round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
            'r2_score': round(r2_score(y_test, y_pred), 4)
        }

        # Training time
        self.training_info['training_time_ms'] = round((time.time() - start_time) * 1000, 2)
        self.training_info['trained_at'] = pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')

        self.is_trained = True
        print(f"Model trained! R2 Score: {self.metrics['r2_score']}")
        return self.metrics

    def predict(self, quantity: float, commodity: str) -> dict:
        """Make a price prediction"""
        if not self.is_trained:
            self.train()

        # Encode commodity
        if commodity not in COMMODITY_ENCODING:
            raise ValueError(f"Unknown commodity: {commodity}. Must be one of {list(COMMODITY_ENCODING.keys())}")

        commodity_encoded = COMMODITY_ENCODING[commodity]

        # Make prediction
        X = np.array([[quantity, commodity_encoded]])
        predicted_price = self.model.predict(X)[0]

        return {
            'predicted_price': round(predicted_price, 2),
            'commodity': commodity,
            'quantity': quantity,
            'model': 'Random Forest',
            'confidence': {
                'r2_score': self.metrics['r2_score'],
                'mae': self.metrics['mae']
            }
        }

    def get_model_info(self) -> dict:
        """Get model information and metrics"""
        if not self.is_trained:
            self.train()

        return {
            'model_name': 'Random Forest Regressor',
            'n_estimators': 100,
            'metrics': self.metrics,
            'features': ['Quantity', 'Commodity'],
            'target': 'Modal Price',
            'commodities': list(COMMODITY_ENCODING.keys()),
            'training_info': self.training_info,
            'is_trained': self.is_trained
        }

    def get_historical_data(self) -> list:
        """Get historical price data for charts"""
        df = self.load_data()

        # Group by date and commodity, get average price
        historical = []
        for commodity_code in df['Commodity'].unique():
            commodity_name = COMMODITY_DECODING[commodity_code]
            commodity_data = df[df['Commodity'] == commodity_code].sort_values('Date')

            for _, row in commodity_data.iterrows():
                historical.append({
                    'date': row['Date'].strftime('%Y-%m-%d'),
                    'commodity': commodity_name,
                    'price': float(row['Modal Price']),
                    'quantity': float(row['Quantity'])
                })

        return historical

    def get_commodities(self) -> list:
        """Get list of available commodities"""
        return [
            {'id': code, 'name': name}
            for name, code in COMMODITY_ENCODING.items()
        ]


# Global model instance
model_instance = CropPriceModel()
