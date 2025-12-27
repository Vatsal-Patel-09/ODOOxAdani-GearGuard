import React from 'react'
import { ThemeToggle } from './theme-toggle'
import { Settings } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className='fixed top-0 right-0 left-0 h-12 w-full bg-background shadow-md flex items-center justify-center'>
        <div className='w-full h-full flex item-center justify-between mx-10'>
            <div className='text-primary flex items-center font-bold gap-2'>
                <Settings className='h-5 w-5 text-primary' />
                GearGuard
            </div>
            <div className='flex items-center'>
                <ThemeToggle />
            </div>
        </div>

    </nav>
  )
}

export default Navbar