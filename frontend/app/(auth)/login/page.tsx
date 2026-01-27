'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/app/store/hooks';
import { setUser } from '@/app/store/authSlice';
import { loginApi } from '@/app/utils/apis/auth-api';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const result = await loginApi(data.email, data.password);
            dispatch(setUser(result.data.user));

            toast.success('Login successful!', {
                description: 'Welcome back to your account',
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast.error('Login failed', {
                description: error?.response?.data?.message || 'Invalid email or password',
            });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className={cn('flex flex-col gap-6')}>
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <img src="/logo.png" alt="Logo" className="w-50 h-20 object-contain mb-1" />
                                        <p className="text-muted-foreground text-balance">Welcome to CodeAtlas! 👋</p>
                                        <p className="text-xs text-muted-foreground text-balance">
                                            Please sign-in to your account and start the adventure
                                        </p>
                                    </div>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            {...register('email')}
                                            disabled={isLoading}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-red-500 mt-0.5">{errors.email.message}</p>
                                        )}
                                    </Field>
                                    <Field>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                                                Forgot your password?
                                            </a>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            {...register('password')}
                                            disabled={isLoading}
                                        />
                                        {errors.password && (
                                            <p className="text-xs text-red-500 mt-0.5">{errors.password.message}</p>
                                        )}
                                    </Field>
                                    <Field>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        />
                                                    </svg>
                                                    Logging in...
                                                </>
                                            ) : (
                                                'Login'
                                            )}
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            </form>
                            <div className="bg-muted relative hidden md:block">
                                <img
                                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Cool Image"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <FieldDescription className="px-6 text-center">
                        This is an administrative CRM exclusively for CodeAtlas.
                    </FieldDescription>
                </div>
            </div>
        </div>
    );
}
