'use client'

import { useState } from 'react'

const DownloadIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const SpinnerIcon = () => (
  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

interface ExportButtonProps {
  monthLabel: string
}

export function ExportButton({ monthLabel }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/export/monthly')
      if (!res.ok) throw new Error('Error al generar el reporte')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+?)"/)?.[1] ?? 'reporte.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail — browser will show nothing; could add toast here
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/40 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <SpinnerIcon /> : <DownloadIcon />}
      {loading ? 'Generando…' : `Exportar ${monthLabel}`}
    </button>
  )
}
