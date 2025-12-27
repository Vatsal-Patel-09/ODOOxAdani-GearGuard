import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import Link from 'next/link'

export default function SignUp() {
    return (
        <section className="flex min-h-screen  px-4 py-16 bg-background">
            <form
                action=""
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
                                className="input sz-md variant-mixed"
                            />
                        </div>

                        <Button className="w-full">Continue</Button>
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