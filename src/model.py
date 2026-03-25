"""Machine Learning Models - Forecasting models"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.arima.model import ARIMA
import warnings
warnings.filterwarnings('ignore')

def load_data(filepath):
    """Load processed data"""
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    df['Date'] = pd.to_datetime(df['Date'])
    return df

def prepare_train_test_split(df, test_size=0.2, random_state=42):
    """Prepare training and testing data"""
    print(f"Preparing train-test split (test_size={test_size})...")
    X = df[['Quantity', 'Commodity']]
    y = df['Modal Price']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    print(f"Training set size: {len(X_train)}")
    print(f"Testing set size: {len(X_test)}")
    return X_train, X_test, y_train, y_test

def train_linear_regression(X_train, y_train):
    """Train Linear Regression model"""
    print("="*60)
    print("LINEAR REGRESSION MODEL")
    print("="*60)
    model = LinearRegression()
    model.fit(X_train, y_train)
    print("OK: Linear Regression model trained")
    return model

def train_random_forest(X_train, y_train, n_estimators=100):
    """Train Random Forest model"""
    print("="*60)
    print("RANDOM FOREST MODEL")
    print("="*60)
    model = RandomForestRegressor(n_estimators=n_estimators, random_state=42)
    model.fit(X_train, y_train)
    print(f"OK: Random Forest model trained with {n_estimators} trees")
    return model

def train_arima_model(df, order=(1, 1, 1)):
    """Train ARIMA model for time series"""
    print("="*60)
    print("ARIMA TIME SERIES MODEL")
    print("="*60)
    df_sorted = df.sort_values('Date')
    prices = df_sorted['Modal Price'].values
    model = ARIMA(prices, order=order)
    fitted_model = model.fit()
    print(f"OK: ARIMA{order} model fitted")
    return fitted_model, prices

def evaluate_model(y_true, y_pred, model_name):
    """Evaluate model performance"""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    print(f"{model_name} Performance:")
    print(f"  MAE: ${mae:.2f}")
    print(f"  RMSE: ${rmse:.2f}")
    print(f"  R2 Score: {r2:.4f}")
    
    return {'MAE': mae, 'RMSE': rmse, 'R2': r2}

def plot_predictions(y_test, predictions, model_name, output_dir):
    """Plot actual vs predicted values"""
    os.makedirs(output_dir, exist_ok=True)
    plt.figure(figsize=(12, 6))
    plt.plot(y_test.values if hasattr(y_test, 'values') else y_test, 'o-', label='Actual', linewidth=2)
    plt.plot(predictions, 's-', label='Predicted', linewidth=2)
    plt.xlabel('Sample Index')
    plt.ylabel('Modal Price ($)')
    plt.title(f'{model_name}: Actual vs Predicted')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    
    filename = f'{output_dir}/{model_name.lower().replace(" ", "_")}_predictions.png'
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"  Saved: {filename}")
    plt.close()

def run_all_models(data_path, output_results_dir, output_graphs_dir):
    """Run all models and save results"""
    print("="*70)
    print("CROP PRICE FORECASTING - MODEL TRAINING")
    print("="*70)
    
    df = load_data(data_path)
    X_train, X_test, y_train, y_test = prepare_train_test_split(df)
    
    all_results = {}
    
    # 1. Linear Regression
    lr_model = train_linear_regression(X_train, y_train)
    lr_pred = lr_model.predict(X_test)
    lr_metrics = evaluate_model(y_test, lr_pred, "Linear Regression")
    all_results['Linear Regression'] = lr_metrics
    plot_predictions(y_test, lr_pred, "Linear Regression", output_graphs_dir)
    
    # 2. Random Forest
    rf_model = train_random_forest(X_train, y_train)
    rf_pred = rf_model.predict(X_test)
    rf_metrics = evaluate_model(y_test, rf_pred, "Random Forest")
    all_results['Random Forest'] = rf_metrics
    plot_predictions(y_test, rf_pred, "Random Forest", output_graphs_dir)
    
    # 3. ARIMA
    arima_model, prices = train_arima_model(df)
    arima_pred = arima_model.fittedvalues
    arima_metrics = evaluate_model(prices, arima_pred, "ARIMA")
    all_results['ARIMA'] = arima_metrics
    plot_predictions(pd.Series(prices), arima_pred, "ARIMA", output_graphs_dir)
    
    # Save results
    os.makedirs(output_results_dir, exist_ok=True)
    results_file = f"{output_results_dir}/model_results.txt"
    
    with open(results_file, 'w', encoding='utf-8') as f:
        f.write("="*70 + "\n")
        f.write("CROP PRICE FORECASTING MODEL RESULTS\n")
        f.write("="*70 + "\n\n")
        
        for model_name, metrics in all_results.items():
            f.write(f"{model_name}:\n")
            f.write(f"  MAE: ${metrics['MAE']:.2f}\n")
            f.write(f"  RMSE: ${metrics['RMSE']:.2f}\n")
            f.write(f"  R2 Score: {metrics['R2']:.4f}\n\n")
        
        f.write("="*70 + "\n")
        f.write("OK: All models trained successfully\n")
        f.write("="*70 + "\n")
    
    print(f"OK: Results saved to {results_file}")
    print("="*70)
    print("OK: MODEL TRAINING COMPLETE")
    print("="*70)
    
    return all_results

if __name__ == "__main__":
    data_path = "dataset/processed_data/cleaned_data.csv"
    results_dir = "outputs/results"
    graphs_dir = "outputs/graphs"
    results = run_all_models(data_path, results_dir, graphs_dir)
