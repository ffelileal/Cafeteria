import { redirect, notFound } from 'next/navigation'
import { getTableBySlug } from '@/lib/repositories/tables.repository'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function MesaPage({ params }: PageProps) {
  const { slug } = await params

  let table
  try {
    table = await getTableBySlug(slug)
  } catch {
    notFound()
  }

  if (!table) notFound()

  redirect(`/menu?mesa=${slug}`)
}
