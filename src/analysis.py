"""Analysis Module - EDA and statistical analysis"""
import pandas as pd
import numpy as np

def load_processed_data(filepath):
    """Load preprocessed data"""
    print(f"Loading processed data from {filepath}...")
    df = pd.read_csv(filepath)
    df['Date'] = pd.to_datetime(df['Date'])
    print(f"Data shape: {df.shape}")
    return df

def get_basic_statistics(df):
    """Calculate basic statistics for the dataset"""
    print("="*60)
    print("BASIC STATISTICS")
    print("="*60)
    
    stats = {
        'shape': df.shape,
        'mean_price': df['Modal Price'].mean(),
        'median_price': df['Modal Price'].median(),
        'std_price': df['Modal Price'].std(),
        'min_price': df['Modal Price'].min(),
        'max_price': df['Modal Price'].max(),
        'unique_commodities': df['Commodity'].nunique()
    }
    
    print(f"Mean Price: ${stats['mean_price']:.2f}")
    print(f"Median Price: ${stats['median_price']:.2f}")
    print(f"Std Dev: ${stats['std_price']:.2f}")
    print(f"Price Range: ${stats['min_price']:.2f} - ${stats['max_price']:.2f}")
    print(f"Unique Commodities: {stats['unique_commodities']}")
    print(f"Total Records: {stats['shape'][0]}")
    
    return stats

def commodity_analysis(df):
    """Analyze price by commodity"""
    print("="*60)
    print("COMMODITY ANALYSIS")
    print("="*60)
    
    commodity_stats = df.groupby('Commodity')['Modal Price'].agg([
        'count', 'mean', 'std', 'min', 'max'
    ]).round(2)
    
    commodity_stats.columns = ['Count', 'Mean Price', 'Std Dev', 'Min Price', 'Max Price']
    
    print("Price Statistics by Commodity:")
    print(commodity_stats)
    
    return commodity_stats

def temporal_analysis(df):
    """Analyze price trends over time"""
    print("="*60)
    print("TEMPORAL ANALYSIS")
    print("="*60)
    
    df['YearMonth'] = df['Date'].dt.to_period('M')
    monthly_avg = df.groupby('YearMonth')['Modal Price'].mean()
    
    price_change = ((monthly_avg.iloc[-1] - monthly_avg.iloc[0]) / monthly_avg.iloc[0]) * 100
    
    print(f"Date Range: {df['Date'].min().date()} to {df['Date'].max().date()}")
    print(f"Total Months: {len(monthly_avg)}")
    print(f"Overall Price Change: {price_change:.2f}%")
    print(f"Highest Monthly Avg: ${monthly_avg.max():.2f}")
    print(f"Lowest Monthly Avg: ${monthly_avg.min():.2f}")
    
    return {'monthly_trend': monthly_avg}

def correlation_analysis(df):
    """Analyze correlations in the data"""
    print("="*60)
    print("CORRELATION ANALYSIS")
    print("="*60)
    
    numeric_df = df.select_dtypes(include=[np.number])
    corr_matrix = numeric_df.corr()
    
    print("Correlation Matrix:")
    print(corr_matrix)
    
    return corr_matrix

def eda_report(input_path):
    """Generate complete EDA report"""
    print("="*70)
    print("EXPLORATORY DATA ANALYSIS REPORT")
    print("="*70)
    
    df = load_processed_data(input_path)
    stats = get_basic_statistics(df)
    commodity_stats = commodity_analysis(df)
    temporal = temporal_analysis(df)
    corr = correlation_analysis(df)
    
    print("="*70)
    print("OK: EDA REPORT COMPLETE")
    print("="*70)

if __name__ == "__main__":
    input_path = "dataset/processed_data/cleaned_data.csv"
    eda_report(input_path)
