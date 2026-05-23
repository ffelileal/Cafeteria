import { getTableBySlug } from '@/lib/repositories/tables.repository'

interface MesaBannerProps {
  slug: string
}

export async function MesaBanner({ slug }: MesaBannerProps) {
  let table
  try {
    table = await getTableBySlug(slug)
  } catch {
    return null
  }

  if (!table) return null

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 border-b border-primary/20 bg-primary/10 px-4 py-2.5 backdrop-blur-sm">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
        {table.table_number}
      </span>
      <p className="text-xs font-medium tracking-wide text-primary">
        {table.name}
      </p>
      <span className="text-primary/40">·</span>
      <p className="text-xs text-primary/70">{table.sector}</p>
      <span className="text-primary/40">·</span>
      <p className="text-xs text-primary/70">{table.capacity} personas</p>
    </div>
  )
}
