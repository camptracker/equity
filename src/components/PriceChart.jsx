import priceHistory from '../priceHistory.json'

const fmt = (n) => n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:2 })

export default function PriceChart({ width = 680, height = 200 }) {
  if (!priceHistory || priceHistory.length === 0) return null

  const data = priceHistory.slice(-10) // Last 10 days
  const prices = data.map(d => d.price)
  const minPrice = Math.min(...prices) * 0.98
  const maxPrice = Math.max(...prices) * 1.02
  const priceRange = maxPrice - minPrice

  const padding = { top: 20, right: 60, bottom: 30, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const getX = (i) => padding.left + (i / (data.length - 1)) * chartWidth
  const getY = (price) => padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight

  const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.price)}`).join(' ')

  const change = prices[prices.length - 1] - prices[0]
  const changePercent = (change / prices[0]) * 100
  const isPositive = change >= 0

  return (
    <div style={{ 
      background:'var(--surface)', 
      borderRadius:16, 
      padding:'16px 20px', 
      border:'1px solid var(--border)',
      marginBottom:12 
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:1 }}>
            📈 Price History (Last 10 Days)
          </div>
          <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>
            FMV: <b style={{ color:'var(--text)' }}>{fmt(prices[prices.length - 1])}</b>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:13, fontWeight:700, color: isPositive ? 'var(--green)' : 'var(--red)' }}>
            {isPositive ? '+' : ''}{fmt(change)}
          </div>
          <div style={{ fontSize:11, color:'var(--text-dim)' }}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <svg width={width} height={height} style={{ display:'block', margin:'0 auto' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padding.top + chartHeight * (1 - t)
          const price = minPrice + priceRange * t
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
                opacity="0.3"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-dim)"
              >
                ${price.toFixed(2)}
              </text>
            </g>
          )
        })}

        {/* X-axis labels (dates) */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 4) !== 0 && i !== data.length - 1) return null
          const x = getX(i)
          const dateStr = new Date(d.date).toLocaleDateString('en-US', { month:'short', day:'numeric' })
          return (
            <text
              key={i}
              x={x}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-dim)"
            >
              {dateStr}
            </text>
          )
        })}

        {/* Area under curve */}
        <path
          d={`${pathData} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`}
          fill="var(--green)"
          opacity="0.1"
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(i)}
              cy={getY(d.price)}
              r="4"
              fill="var(--green)"
              stroke="var(--bg)"
              strokeWidth="2"
            />
            {/* Tooltip on hover */}
            <title>{`${d.date}: ${fmt(d.price)}`}</title>
          </g>
        ))}

        {/* Current price indicator */}
        <g>
          <line
            x1={padding.left + chartWidth}
            y1={getY(prices[prices.length - 1])}
            x2={width - padding.right + 40}
            y2={getY(prices[prices.length - 1])}
            stroke="var(--green)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <text
            x={width - padding.right + 8}
            y={getY(prices[prices.length - 1]) + 4}
            fontSize="11"
            fontWeight="600"
            fill="var(--green)"
          >
            {fmt(prices[prices.length - 1])}
          </text>
        </g>
      </svg>
    </div>
  )
}
