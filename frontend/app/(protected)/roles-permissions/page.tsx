'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, PlusIcon } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { IRole } from '@/interfaces/role.interface';
import { IPolicy } from '@/interfaces/policy.interface';
import { getAllRolesApi, createRoleApi, updateRoleApi, deleteRoleApi } from '@/app/utils/apis/role-api';
import { RoleDialog } from './role-dialog';
import { DeleteDialog } from '../projects/delete-dialog';
import { toast } from 'sonner';
import { formatDistance } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { showErrorToast } from '@/app/utils/error-handler';
import { useAppDispatch } from '@/app/store/hooks';
import { getAllPoliciesApi } from '@/app/utils/apis/policy-api';
import { setPolicies } from '@/app/store/policySlice';

interface RoleFormData {
    role: string;
    role_display_name: string;
    desc?: string;
    policy?: IPolicy[];
}

const createColumns = (onEdit: (role: IRole) => void, onDelete: (role: IRole) => void): ColumnDef<IRole>[] => [
    {
        accessorKey: 'role',
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Role Key
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Badge variant="outline" className="font-mono text-sm">
                    {row.getValue('role')}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: 'role_display_name',
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Display Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="text-center">{row.getValue('role_display_name')}</div>,
    },
    {
        accessorKey: 'desc',
        header: () => <div className="text-center">Description</div>,
        cell: ({ row }) => {
            const desc = row.getValue('desc') as string;
            return <div className="text-center text-muted-foreground">{desc || '-'}</div>;
        },
    },
    {
        accessorKey: 'permissions',
        header: () => <div className="text-center">Permissions</div>,
        cell: ({ row }) => {
            const permissions = row.getValue('permissions') as string[];
            return (
                <div className="flex justify-center flex-wrap gap-1">
                    {permissions && permissions.length > 0 ? (
                        permissions.slice(0, 3).map((permission, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                                {permission}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                    {permissions && permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{permissions.length - 3}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'policy',
        header: () => <div className="text-center">Policies</div>,
        cell: ({ row }) => {
            const policies = row.getValue('policy') as IRole['policy'];
            return (
                <div className="flex justify-center flex-wrap gap-1">
                    {policies && policies.length > 0 ? (
                        <>
                            {policies.slice(0, 2).map((policy, idx) => (
                                <Badge key={idx} variant="default" className="text-xs">
                                    {policy.resource}:{policy.action}
                                </Badge>
                            ))}
                            {policies.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{policies.length - 2}
                                </Badge>
                            )}
                        </>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: () => <div className="text-center">Created</div>,
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string;
            return date ? (
                <div className="flex justify-center">
                    <span className="text-sm text-muted-foreground">
                        {formatDistance(new Date(date), new Date(), { addSuffix: true })}
                    </span>
                </div>
            ) : (
                <div className="text-center">-</div>
            );
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
            const role = row.original as IRole;
            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(role._id || '')}>
                                    Copy role ID
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(role)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit role
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(role)}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete role
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

export default function RolePermissions() {
    const dispatch = useAppDispatch();
    const [data, setData] = React.useState<IRole[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState<IRole | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fetchRoles = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllRolesApi();
            setData(response);
        } catch (error: any) {
            setError(error?.response?.data?.message || 'Something went wrong while fetching roles.');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPolicies = React.useCallback(async () => {
        try {
            const policies = await getAllPoliciesApi();
            dispatch(setPolicies(policies));
        } catch (error: any) {
            showErrorToast(error);
        }
    }, []);

    React.useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    React.useEffect(() => {
        if (!isEditDialogOpen && !isCreateDialogOpen) return;
        fetchPolicies();
    }, [isEditDialogOpen, isCreateDialogOpen]);

    const handleCreate = async (data: RoleFormData) => {
        try {
            setIsSubmitting(true);
            const payload = {
                role: data.role,
                role_display_name: data.role_display_name,
                desc: data.desc,
                policy: data.policy || [],
            };
            await createRoleApi(payload);
            setIsCreateDialogOpen(false);
            toast.success('Role created successfully');
            fetchRoles();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (data: RoleFormData) => {
        if (!selectedRole?._id) return;
        try {
            setIsSubmitting(true);
            const payload = {
                role_display_name: data.role_display_name,
                desc: data.desc,
                policy: data.policy || [],
            };
            await updateRoleApi(selectedRole._id!, payload);
            setIsEditDialogOpen(false);
            setSelectedRole(null);
            toast.success('Role updated successfully');
            fetchRoles();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRole?._id) return;
        try {
            setIsSubmitting(true);
            await deleteRoleApi(selectedRole._id!);
            setIsDeleteDialogOpen(false);
            setSelectedRole(null);
            toast.success('Role deleted successfully');
            fetchRoles();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (role: IRole) => {
        setSelectedRole(role);
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (role: IRole) => {
        setSelectedRole(role);
        setIsDeleteDialogOpen(true);
    };

    const columns = createColumns(handleEdit, handleDeleteClick);

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground">Manage roles and their access permissions.</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
                    {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="Search roles..."
                showColumnVisibility={true}
                showSearch={true}
                emptyMessage="No roles found."
                loadingMessage="Loading roles..."
                actionButtons={[
                    {
                        label: 'Create Role',
                        onClick: () => setIsCreateDialogOpen(true),
                        icon: <PlusIcon className="mr-2 h-4 w-4" />,
                    },
                ]}
            />

            {/* Create Dialog */}
            <RoleDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreate}
                isLoading={isSubmitting}
            />

            {/* Edit Dialog */}
            <RoleDialog
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setSelectedRole(null);
                }}
                onSubmit={handleUpdate}
                role={selectedRole}
                isLoading={isSubmitting}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setSelectedRole(null);
                }}
                onConfirm={handleDelete}
                title="Delete Role"
                description={`Are you sure you want to delete "${selectedRole?.role_display_name}"? This action cannot be undone.`}
                isLoading={isSubmitting}
            />
        </div>
    );
}
