import { ThemeToggle } from '@/components/theme-toggle'
import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=''>
        <div className='fixed top-0 right-0 p-2'>
          <ThemeToggle />
        </div>
        {children}
    </div>
  )
}

export default Layout