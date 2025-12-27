"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Check for user in localStorage
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch {
                localStorage.removeItem("user")
            }
        }
        setIsLoading(false)
    }, [])

    useEffect(() => {
        // Redirect to sign-in if not authenticated and not on auth pages
        if (!isLoading && !user) {
            const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")
            if (!isAuthPage) {
                router.push("/sign-in")
            }
        }
    }, [user, isLoading, pathname, router])

    const logout = () => {
        localStorage.removeItem("user")
        setUser(null)
        router.push("/sign-in")
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
