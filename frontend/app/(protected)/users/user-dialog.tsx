'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IUser } from '@/interfaces/user.interface';
import { useAppSelector } from '@/app/store/hooks';
import { IPolicy } from '@/interfaces/policy.interface';
import { PolicyMultiSelect } from '@/components/policy-multi-select';

interface UserFormData {
    full_name: string;
    email: string;
    password?: string;
    status?: string;
    policy?: IUser['policy'];
}

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UserFormData) => Promise<void>;
    user?: IUser | null;
    isLoading?: boolean;
}

export function UserDialog({ open, onOpenChange, onSubmit, user, isLoading = false }: UserDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UserFormData>({
        defaultValues: user
            ? {
                  full_name: user.full_name,
                  email: user.email,
                  status: user.status || 'Active',
                  policy: user.policy || [],
              }
            : {
                  full_name: '',
                  email: '',
                  password: '',
                  status: 'Active',
                  policy: [],
              },
    });

    const statusValue = watch('status');
    const selectedPolicies = watch('policy') || [];
    const policies = useAppSelector((s) => s.policy.policies) as IPolicy[];
    const handlePoliciesChange = (newPolicies: IPolicy[]) => {
        setValue('policy', newPolicies);
    };

    React.useEffect(() => {
        if (user) {
            reset({
                full_name: user.full_name,
                email: user.email,
                status: user.status || 'Active',
                policy: user.policy || [],
            });
        } else {
            reset({
                full_name: '',
                email: '',
                password: '',
                status: 'Active',
                policy: [],
            });
        }
    }, [user, reset]);

    const onFormSubmit = async (data: UserFormData) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-131.25">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'Update the user details below.' : 'Add a new user to your workspace.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="full_name"
                                {...register('full_name', { required: 'Full name is required' })}
                                placeholder="Enter full name"
                            />
                            {errors.full_name && (
                                <span className="text-sm text-red-500">{errors.full_name.message}</span>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                placeholder="user@example.com"
                                disabled={!!user}
                            />
                            {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                        </div>
                        {!user && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password', {
                                        required: !user ? 'Password is required' : false,
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                    placeholder="Enter password"
                                />
                                {errors.password && (
                                    <span className="text-sm text-red-500">{errors.password.message}</span>
                                )}
                            </div>
                        )}

                        {/* Policies Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Access Policies</h3>
                            <PolicyMultiSelect
                                policies={selectedPolicies}
                                availablePolicies={policies}
                                onChange={handlePoliciesChange}
                            />
                        </div>

                        {/* Status Section */}
                        {user && (
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={statusValue} onValueChange={(value) => setValue('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : user ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
