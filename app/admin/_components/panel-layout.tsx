import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/ssr'
import { Sidebar } from '../dashboard/_components/sidebar'

export async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar email={user.email ?? ''} />
      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  )
}
