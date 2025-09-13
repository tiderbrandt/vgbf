import { Metadata } from 'next'
import MenuManager from '@/components/admin/MenuManager'

export const metadata: Metadata = {
  title: 'Menu Management - VGBF Admin',
  description: 'Manage website navigation menus'
}

export default function AdminMenusPage() {
  return <MenuManager />
}