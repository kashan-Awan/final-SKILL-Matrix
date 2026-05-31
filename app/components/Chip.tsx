"use client"

interface ChipProps {
  label: string
  className?: string
}

export default function Chip({ label, className = "" }: ChipProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
