import { getAdminProducts } from '@/lib/admin/queries'
import { ProductsShell } from './_components/products-shell'

export default async function ProductsPage() {
  const products = await getAdminProducts()

  return (
    <div className="px-6 py-8 lg:px-8 xl:px-10">
      <ProductsShell products={products} />
    </div>
  )
}
