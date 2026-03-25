import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const commodityColors = {
  'Wheat': { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' },
  'Rice': { border: '#22c55e', background: 'rgba(34, 197, 94, 0.1)' },
  'Corn': { border: '#eab308', background: 'rgba(234, 179, 8, 0.1)' },
}

function PriceChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    // Group data by commodity
    const commodities = [...new Set(data.map(d => d.commodity))]

    // Get unique dates sorted
    const dates = [...new Set(data.map(d => d.date))].sort()

    const datasets = commodities.map(commodity => {
      const commodityData = data.filter(d => d.commodity === commodity)
      const priceByDate = {}
      commodityData.forEach(d => {
        priceByDate[d.date] = d.price
      })

      return {
        label: commodity,
        data: dates.map(date => priceByDate[date] || null),
        borderColor: commodityColors[commodity]?.border || '#6b7280',
        backgroundColor: commodityColors[commodity]?.background || 'rgba(107, 114, 128, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true,
      }
    })

    return {
      labels: dates.map(d => {
        const date = new Date(d)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      datasets,
    }
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y?.toLocaleString() || 'N/A'}`
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString()
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  }

  if (!chartData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📉</span>
          Historical Price Trends
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Loading chart data...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">📉</span>
        Historical Price Trends
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Price movements of agricultural commodities over time
      </p>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

export default PriceChart
