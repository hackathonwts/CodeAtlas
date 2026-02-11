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
import { Textarea } from '@/components/ui/textarea';
import { IRole } from '@/interfaces/role.interface';
import { useAppSelector } from '@/app/store/hooks';
import { IPolicy } from '@/interfaces/policy.interface';
import { PolicyMultiSelect } from '@/components/policy-multi-select';

interface RoleFormData {
    role: string;
    role_display_name: string;
    desc?: string;
    policies?: IRole['policies'];
}

interface RoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: RoleFormData) => Promise<void>;
    role?: IRole | null;
    isLoading?: boolean;
}

export function RoleDialog({ open, onOpenChange, onSubmit, role, isLoading = false }: RoleDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RoleFormData>({
        defaultValues: role
            ? {
                role: role.role,
                role_display_name: role.role_display_name,
                desc: role.desc || '',
                policies: role.policies || [],
            }
            : {
                role: '',
                role_display_name: '',
                desc: '',
                policies: [],
            }
    });

    React.useEffect(() => {
        if (role) {
            reset({
                role: role.role,
                role_display_name: role.role_display_name,
                desc: role.desc || '',
                policies: role.policies || [],
            });
        } else {
            reset({
                role: '',
                role_display_name: '',
                desc: '',
                policies: [],
            });
        }
    }, [role, reset]);

    const onFormSubmit = async (data: RoleFormData) => {
        await onSubmit(data);
        reset();
    };
    const selectedPolicies = watch('policies') || [];
    console.log("selectedPolicies: ", selectedPolicies);
    const policies = useAppSelector((s) => s.policy.policies) as IPolicy[];
    const handlePoliciesChange = (newPolicies: IPolicy[]) => {
        setValue('policies', newPolicies);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-131.25">
                <DialogHeader>
                    <DialogTitle>{role ? 'Edit Role' : 'Create Role'}</DialogTitle>
                    <DialogDescription>
                        {role ? 'Update the role details below.' : 'Add a new role to your system.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role">
                                Role Key <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="role"
                                {...register('role', { required: 'Role key is required' })}
                                placeholder="e.g., admin, user, manager"
                                disabled={!!role}
                            />
                            {errors.role && <span className="text-sm text-red-500">{errors.role.message}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role_display_name">
                                Display Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="role_display_name"
                                {...register('role_display_name', {
                                    required: 'Display name is required',
                                })}
                                placeholder="Administrator"
                            />
                            {errors.role_display_name && (
                                <span className="text-sm text-red-500">{errors.role_display_name.message}</span>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="grid gap-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea id="desc" {...register('desc')} placeholder="Role description" rows={3} />
                        </div>

                        {/* Policies Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Access Policies</h3>
                            <PolicyMultiSelect
                                policies={selectedPolicies}
                                availablePolicies={policies}
                                onChange={handlePoliciesChange}
                            />
                        </div>
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
                            {isLoading ? 'Saving...' : role ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
