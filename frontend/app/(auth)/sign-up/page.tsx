'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/api'

export default function SignUp() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [terms, setTerms] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate password match
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        // Validate password strength
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (!terms) {
            setError('Please accept the terms and conditions')
            return
        }

        setLoading(true)

        try {
            const response = await register(name, email, password)
            // Store full response including access_token
            localStorage.setItem('user', JSON.stringify(response))
            // Redirect to dashboard
            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen bg-[#F9FAFB] dark:bg-background">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#714B67] flex-col justify-center items-center p-12">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6">
                        <Settings className="w-8 h-8 text-[#714B67]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">GearGuard</h1>
                    <p className="text-white/80 text-lg">
                        Join thousands of teams managing their equipment maintenance efficiently.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-[#714B67] rounded-lg flex items-center justify-center mb-3">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-[#111827] dark:text-foreground">GearGuard</h1>
                    </div>

                    <div className="bg-white dark:bg-card rounded-lg border border-[#E5E7EB] dark:border-border p-8 shadow-sm">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-[#111827] dark:text-foreground">Create an account</h2>
                            <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-1">Get started with GearGuard today</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-destructive/10 border border-red-200 dark:border-destructive/20 text-red-600 dark:text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-[#374151] dark:text-foreground">
                                    Full Name
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] dark:text-muted-foreground" />
                                    <Input
                                        type="text"
                                        required
                                        name="name"
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10 w-full h-10 border border-[#E5E7EB] dark:border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-[#374151] dark:text-foreground">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] dark:text-muted-foreground" />
                                    <Input
                                        type="email"
                                        required
                                        name="email"
                                        id="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 w-full h-10 border border-[#E5E7EB] dark:border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-[#374151] dark:text-foreground">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] dark:text-muted-foreground" />
                                    <Input
                                        type="password"
                                        required
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 w-full h-10 border border-[#E5E7EB] dark:border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#374151] dark:text-foreground">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] dark:text-muted-foreground" />
                                    <Input
                                        type="password"
                                        required
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`pl-10 w-full h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] ${
                                            confirmPassword && password !== confirmPassword
                                                ? "border-red-400"
                                                : "border-[#E5E7EB] dark:border-input"
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={terms}
                                    onChange={(e) => setTerms(e.target.checked)}
                                    className="w-4 h-4 mt-1 rounded border-gray-300 text-[#714B67] focus:ring-[#714B67] focus:ring-offset-0"
                                />
                                <label htmlFor="terms" className="text-sm text-[#6B7280] dark:text-muted-foreground cursor-pointer">
                                    I agree to the{" "}
                                    <span className="text-[#714B67] hover:text-[#5d3d56] transition-colors duration-300 font-medium">
                                        Terms of Service
                                    </span>{" "}
                                    and{" "}
                                    <span className="text-[#714B67] hover:text-[#5d3d56] transition-colors duration-300 font-medium">
                                        Privacy Policy
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#714B67] hover:bg-[#5d3d56] text-white h-10 rounded-lg font-medium transition-colors mt-2"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-[#6B7280] dark:text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/sign-in" className="text-[#714B67] font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}