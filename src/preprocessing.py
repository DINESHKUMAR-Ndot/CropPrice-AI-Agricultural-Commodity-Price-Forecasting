"""Preprocessing Module - Data cleaning and transformation"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os

def load_data(filepath):
    """Load CSV data from file"""
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    print(f"Data shape: {df.shape}")
    return df

def handle_missing_values(df, strategy='mean'):
    """Handle missing values in dataset"""
    print(f"Checking for missing values...")
    print(f"Missing values before:\n{df.isnull().sum()}")
    
    if strategy == 'mean':
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
    
    print(f"Missing values after:\n{df.isnull().sum()}")
    return df

def remove_duplicates(df):
    """Remove duplicate rows from dataset"""
    print(f"Checking for duplicates...")
    print(f"Duplicate rows before: {df.duplicated().sum()}")
    df = df.drop_duplicates(keep='first')
    print(f"Duplicate rows after: {df.duplicated().sum()}")
    return df

def convert_date_column(df, date_column='Date'):
    """Convert date column to datetime format"""
    print(f"Converting {date_column} to datetime...")
    df[date_column] = pd.to_datetime(df[date_column])
    print(f"Date range: {df[date_column].min()} to {df[date_column].max()}")
    return df

def handle_outliers(df, columns=None, method='iqr', threshold=1.5):
    """Handle outliers using IQR method"""
    print(f"Handling outliers using {method} method...")
    
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns
    
    df_copy = df.copy()
    
    for col in columns:
        if method == 'iqr':
            Q1 = df_copy[col].quantile(0.25)
            Q3 = df_copy[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - (threshold * IQR)
            upper_bound = Q3 + (threshold * IQR)
            
            outliers_before = ((df_copy[col] < lower_bound) | (df_copy[col] > upper_bound)).sum()
            df_copy[col] = np.where(df_copy[col] < lower_bound, lower_bound, df_copy[col])
            df_copy[col] = np.where(df_copy[col] > upper_bound, upper_bound, df_copy[col])
            
            print(f"  {col}: Capped {outliers_before} outliers")
    
    return df_copy

def label_encode_categorical(df, columns=None):
    """Label encode categorical columns"""
    print(f"Label encoding categorical columns...")
    
    if columns is None:
        columns = df.select_dtypes(include=['object']).columns.tolist()
    
    encoders = {}
    df_copy = df.copy()
    
    for col in columns:
        if col in df_copy.columns:
            le = LabelEncoder()
            df_copy[col] = le.fit_transform(df_copy[col].astype(str))
            encoders[col] = le
            print(f"  {col}: Encoded {len(le.classes_)} unique values")
    
    return df_copy, encoders

def preprocess_pipeline(input_filepath, output_filepath):
    """Complete preprocessing pipeline"""
    print("="*60)
    print("PREPROCESSING PIPELINE")
    print("="*60)
    
    df = load_data(input_filepath)
    print(f"Initial shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    df = handle_missing_values(df, strategy='mean')
    df = remove_duplicates(df)
    df = convert_date_column(df, date_column='Date')
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    df = handle_outliers(df, columns=numeric_cols, method='iqr', threshold=1.5)
    
    df, encoders = label_encode_categorical(df, columns=['Commodity'])
    
    os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
    df.to_csv(output_filepath, index=False)
    print(f"OK: Cleaned data saved to {output_filepath}")
    print(f"Final shape: {df.shape}")
    print("="*60)
    
    return df, encoders

if __name__ == "__main__":
    input_path = "dataset/raw_data/crop_prices.csv"
    output_path = "dataset/processed_data/cleaned_data.csv"
    df_cleaned, enc = preprocess_pipeline(input_path, output_path)
    print("OK: Preprocessing completed successfully!")
