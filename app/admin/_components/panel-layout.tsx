import { requireAdmin } from '@/lib/auth/session'
import { Sidebar } from '../dashboard/_components/sidebar'
import { AdminNotifier } from './admin-notifier'
import { OrdersNotificationProvider } from './orders-notification-provider'

export async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()

  return (
    <OrdersNotificationProvider>
      <div className="flex min-h-screen">
        <Sidebar email={user.email ?? ''} />
        <AdminNotifier />
        <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">
          {children}
        </div>
      </div>
    </OrdersNotificationProvider>
  )
}
