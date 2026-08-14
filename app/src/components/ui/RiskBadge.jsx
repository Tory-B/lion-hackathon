import Badge from './Badge'

const RISK_META = {
  LOW: { label: '안전', tone: 'brand' },
  MEDIUM: { label: '보통', tone: 'neutral' },
  HIGH: { label: '위험', tone: 'danger' },
}

export default function RiskBadge({ level, className = '' }) {
  const meta = RISK_META[level] ?? { label: level, tone: 'neutral' }
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  )
}
