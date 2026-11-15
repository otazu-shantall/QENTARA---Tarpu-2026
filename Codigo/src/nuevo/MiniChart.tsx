// Escrito con asistencia de OpenAI Codex; separado en su archivo con Claude Code. Registro en entrega/uso-de-ia.md.
import { number } from './data'

export const months = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function MiniChart({
  values,
  color,
  id,
  label,
}: {
  values: (number | null)[]
  color: string
  id: string
  label: string
}) {
  const numbers = values.filter((value): value is number => value !== null)
  if (!numbers.length) return <p>Sin registros disponibles.</p>
  const min = Math.min(...numbers),
    max = Math.max(...numbers)
  const y = (value: number) => 100 - ((value - min) / (max - min || 1)) * 65
  const x = (index: number) =>
    10 + (index * 280) / Math.max(1, values.length - 1)
  const line = values
    .map((value, index) =>
      value === null
        ? ''
        : `${index === 0 || values[index - 1] === null ? 'M' : 'L'}${x(index)} ${y(value)}`,
    )
    .join(' ')
  const complete = values.every((value) => value !== null)
  return (
    <svg
      className="mini-chart"
      viewBox="0 0 300 133"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[35, 65, 100].map((position) => (
        <line
          key={position}
          x1="0"
          y1={position}
          x2="300"
          y2={position}
          stroke="#e1e6df"
          strokeDasharray="3 4"
        />
      ))}
      {complete && (
        <path d={`${line} L290 110 L10 110 Z`} fill={`url(#${id})`} />
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map(
        (value, index) =>
          value !== null && (
            <circle
              key={index}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill={color}
            >
              <title>{number(value, 2)}</title>
            </circle>
          ),
      )}
      {values.length === 12 &&
        months.map((month, index) => (
          <text key={index} x={x(index)} y="130" textAnchor="middle">
            {month}
          </text>
        ))}
    </svg>
  )
}
