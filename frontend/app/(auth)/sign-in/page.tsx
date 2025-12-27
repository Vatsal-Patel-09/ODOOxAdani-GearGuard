import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import Link from 'next/link'

export default function SignIn() {
    return (
        <section className="flex min-h-screen  px-4 py-16 bg-background">
            <form
                action=""
                className="bg-transparent m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)]  p-0.5  ">
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
                                className="input sz-md variant-mixed"
                            />
                        </div>

                        <Button className="w-full">Sign In</Button>
                    </div>
                </div>

                <div className=" rounded-(--radius) p-3 ">
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