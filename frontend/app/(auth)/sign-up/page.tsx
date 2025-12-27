'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
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

        setLoading(true)

        try {
            const response = await register(name, email, password)
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify(response))
            // Redirect to home or dashboard
            router.push('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen px-4 py-16 bg-background">
            <form
                onSubmit={handleSubmit}
                className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] p-0.5 ">
                <div className="p-8 pb-0">
                    <div className='flex flex-col items-center justify-center'>
                        <Link
                            href="/"
                            aria-label="go home">
                            <Settings className="h-8 w-8 text-primary" />
                        </Link>
                        <h1 className="mb-1 mt-2 text-xl font-semibold">Create a GearGuard Account</h1>
                        <p className="text-sm">Welcome! Create an account to get started</p>
                    </div>

                    <hr className="my-4 border-dashed" />

                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">

                        <div className="space-y-2">
                            <Label
                                htmlFor="firstname"
                                className="block text-sm">
                                Name
                            </Label>
                            <Input
                                type="text"
                                required
                                name="firstname"
                                id="firstname"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
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

                        <div className="space-y-2">
                            <Label
                                htmlFor="pwd"
                                className="text-sm">
                                Password
                            </Label>
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

                        <div className="space-y-2">
                            <Label
                                htmlFor="confirmPwd"
                                className="text-sm">
                                Confirm Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="confirmPwd"
                                id="confirmPwd"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input sz-md variant-mixed"
                            />
                        </div>

                        <Button className="w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Continue'}
                        </Button>
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Have an account ?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}