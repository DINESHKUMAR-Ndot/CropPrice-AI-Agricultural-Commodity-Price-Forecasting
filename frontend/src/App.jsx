import { useState, useEffect } from 'react'
import PredictionForm from './components/PredictionForm'
import PredictionResult from './components/PredictionResult'
import PriceChart from './components/PriceChart'
import ModelInfo from './components/ModelInfo'
import axios from 'axios'

const API_URL = 'http://localhost:8001'

function App() {
  const [prediction, setPrediction] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retraining, setRetraining] = useState(false)
  const [predictionSteps, setPredictionSteps] = useState([])

  // Fetch model info and historical data on mount
  useEffect(() => {
    fetchModelInfo()
    fetchHistoricalData()
  }, [])

  const fetchModelInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/model-info`)
      setModelInfo(response.data)
    } catch (err) {
      console.error('Failed to fetch model info:', err)
    }
  }

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(`${API_URL}/historical`)
      setHistoricalData(response.data.data)
    } catch (err) {
      console.error('Failed to fetch historical data:', err)
    }
  }

  const handleRetrain = async () => {
    setRetraining(true)
    try {
      const response = await axios.post(`${API_URL}/retrain`)
      setModelInfo(prev => ({
        ...prev,
        metrics: response.data.metrics,
        training_info: response.data.training_info
      }))
      alert('Model retrained successfully!')
    } catch (err) {
      alert('Retraining failed: ' + err.message)
    } finally {
      setRetraining(false)
    }
  }

  const handlePredict = async (quantity, commodity) => {
    setLoading(true)
    setError(null)
    setPrediction(null)

    // Show live prediction steps
    const steps = [
      { text: `Received input: ${commodity}, ${quantity} quintals`, done: false },
      { text: `Encoding ${commodity} to numeric value...`, done: false },
      { text: 'Passing features to Random Forest...', done: false },
      { text: 'Aggregating predictions from 100 trees...', done: false },
      { text: 'Calculating final prediction...', done: false },
    ]

    // Animate steps
    for (let i = 0; i < steps.length; i++) {
      setPredictionSteps([...steps.slice(0, i + 1).map((s, idx) => ({ ...s, done: idx < i }))])
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    try {
      const response = await axios.post(`${API_URL}/predict`, {
        quantity: parseFloat(quantity),
        commodity: commodity
      })

      // Mark all steps as done
      setPredictionSteps(steps.map(s => ({ ...s, done: true })))

      setPrediction(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Please try again.')
      setPrediction(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-crop text-white py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌾</span>
              <div>
                <h1 className="text-3xl font-bold">CropPrice AI</h1>
                <p className="text-green-100 mt-1">Agricultural Commodity Price Forecasting</p>
              </div>
            </div>
            {/* Retrain Button */}
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                retraining
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-white text-green-700 hover:bg-green-50'
              }`}
            >
              {retraining ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Retraining...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🔄 Retrain Model
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Model Info Banner */}
        {modelInfo && (
          <ModelInfo info={modelInfo} />
        )}

        {/* Prediction Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Left: Form */}
          <div>
            <PredictionForm onPredict={handlePredict} loading={loading} />

            {/* Live Prediction Steps */}
            {loading && predictionSteps.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <span className="animate-pulse">⚡</span> Live Processing
                </h4>
                <div className="space-y-2">
                  {predictionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {step.done ? (
                        <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                      ) : (
                        <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center animate-pulse text-xs">...</span>
                      )}
                      <span className={step.done ? 'text-green-700' : 'text-blue-700'}>{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right: Result */}
          <div>
            <PredictionResult prediction={prediction} loading={loading} />
          </div>
        </div>

        {/* Historical Price Chart */}
        <div className="mt-12">
          <PriceChart data={historicalData} />
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-800">Select Commodity</h3>
              <p className="text-gray-600 text-sm mt-2">
                Choose from Wheat, Rice, or Corn crops
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-800">Enter Quantity</h3>
              <p className="text-gray-600 text-sm mt-2">
                Input the quantity of commodity to trade
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-800">Get Prediction</h3>
              <p className="text-gray-600 text-sm mt-2">
                ML model predicts the optimal price instantly
              </p>
            </div>
          </div>
        </div>

        {/* ML Pipeline Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>🔬</span> Backend ML Pipeline
          </h2>
          <p className="text-gray-600 mb-6">Here's what happens when you make a prediction:</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Data Processing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                Data Preprocessing
              </h3>
              <div className="ml-10 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Load historical crop price dataset ({modelInfo?.training_info?.total_records || '...'} records)
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Handle missing values using mean imputation
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Remove duplicate entries
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Handle outliers using IQR method
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Label encode commodities (Corn=0, Rice=1, Wheat=2)
                </p>
              </div>

              <h3 className="font-semibold text-gray-700 flex items-center gap-2 pt-4">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                Model Training
              </h3>
              <div className="ml-10 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Split data: {modelInfo?.training_info?.train_size || '...'} training, {modelInfo?.training_info?.test_size || '...'} testing
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Train {modelInfo?.model_name || 'Random Forest'} with {modelInfo?.n_estimators || 100} decision trees
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Features used: {modelInfo?.features?.join(' + ') || 'Quantity + Commodity'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Target variable: {modelInfo?.target || 'Modal Price'} (₹/quintal)
                </p>
                <p className="flex items-center gap-2 text-xs text-blue-500">
                  ⏱️ Training time: {modelInfo?.training_info?.training_time_ms || '...'}ms
                </p>
              </div>
            </div>

            {/* Right Column - Prediction */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                Making Predictions
              </h3>
              <div className="ml-10 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="text-blue-500">→</span>
                  Receive input: commodity + quantity
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-500">→</span>
                  Encode commodity to numeric value
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-500">→</span>
                  Pass features to Random Forest model
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-500">→</span>
                  Aggregate predictions from 100 trees
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-500">→</span>
                  Return predicted price with confidence
                </p>
              </div>

              <h3 className="font-semibold text-gray-700 flex items-center gap-2 pt-4">
                <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm">4</span>
                Model Performance {!modelInfo && <span className="text-xs text-gray-400">(Loading...)</span>}
              </h3>
              <div className="ml-10 space-y-2 text-sm">
                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                  <span className="text-gray-600">R² Score (Accuracy)</span>
                  <span className="font-bold text-green-600">
                    {modelInfo ? `${(modelInfo.metrics.r2_score * 100).toFixed(2)}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                  <span className="text-gray-600">Mean Absolute Error</span>
                  <span className="font-bold text-blue-600">
                    {modelInfo ? `±₹${modelInfo.metrics.mae}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-3">
                  <span className="text-gray-600">Root Mean Square Error</span>
                  <span className="font-bold text-purple-600">
                    {modelInfo ? `₹${modelInfo.metrics.rmse}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>CropPrice AI - Powered by Machine Learning</p>
          <p className="text-sm text-gray-500 mt-2">
            {modelInfo
              ? `${modelInfo.model_name} with ${(modelInfo.metrics.r2_score * 100).toFixed(2)}% accuracy (R² Score)`
              : 'Loading model information...'
            }
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
