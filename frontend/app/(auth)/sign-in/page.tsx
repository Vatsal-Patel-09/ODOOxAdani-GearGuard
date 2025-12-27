'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'

export default function SignIn() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await login(email, password)
            // Store user info and token in localStorage
            localStorage.setItem('user', JSON.stringify({
                id: response.id,
                name: response.name,
                email: response.email,
                role: response.role,
            }))
            localStorage.setItem('access_token', response.access_token)
            // Redirect to dashboard
            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen px-4 py-16 bg-background">
            <form
                onSubmit={handleSubmit}
                className="bg-transparent m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] p-0.5">
                <div className="p-8 pb-0">
                    <div className='flex items-center justify-center flex-col'>
                        <Link
                            href="/"
                            aria-label="go home">
                            <Settings className="h-8 w-8 text-primary" />
                        </Link>
                        <h1 className="mb-1 mt-2 text-xl font-semibold">Sign In to GearGuard</h1>
                        <p className="text-sm">Welcome back! Sign in to continue</p>
                    </div>

                    <hr className="my-4 border-dashed" />

                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email address
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="pwd"
                                    className="text-sm">
                                    Password
                                </Label>
                                <Button
                                    asChild
                                    variant="link"
                                    size="sm">
                                    <Link
                                        href="#"
                                        className="link intent-info variant-ghost text-sm">
                                        Forgot your Password ?
                                    </Link>
                                </Button>
                            </div>
                            <Input
                                type="password"
                                required
                                name="pwd"
                                id="pwd"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input sz-md variant-mixed"
                            />
                        </div>

                        <Button className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </div>
                </div>

                <div className="rounded-(--radius) p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Don&apos;t have an account ?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/sign-up">Create account</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}