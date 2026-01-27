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
import { IUser } from '@/interfaces/user.interface';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import {
    getAllUsersApi,
    createUserApi,
    updateUserApi,
    deleteUserApi,
    CreateUserPayload,
    UpdateUserPayload,
} from '@/app/utils/apis/user-api';
import { UserDialog } from './user-dialog';
import { DeleteDialog } from '../projects/delete-dialog';
import { formatDistance } from 'date-fns';
import { showErrorToast } from '@/app/utils/error-handler';
import { getAllPoliciesApi } from '@/app/utils/apis/policy-api';
import { setPolicies } from '@/app/store/policySlice';
import { useAppDispatch } from '@/app/store/hooks';

const createColumns = (onEdit: (user: IUser) => void, onDelete: (user: IUser) => void): ColumnDef<IUser>[] => [
    {
        id: 'avatar',
        header: () => <div className="text-center">Project</div>,
        cell: ({ row }) => {
            const title = row.original.full_name;
            return (
                <div className="flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                            {title?.charAt(0).toUpperCase() || 'P'}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'full_name',
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="text-center">{row.getValue('full_name')}</div>,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="lowercase text-center">{row.getValue('email')}</div>,
    },
    {
        accessorKey: 'status',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <div className="flex justify-center">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}
                    >
                        {status}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'roles',
        header: () => <div className="text-center">Roles</div>,
        cell: ({ row }) => {
            const roles = row.getValue('roles') as IUser['roles'];
            return (
                <div className="capitalize text-center">
                    {roles?.map((role) => role.role_display_name).join(', ') || '-'}
                </div>
            );
        },
    },
    {
        accessorKey: 'policy',
        header: () => <div className="text-center">Policies</div>,
        cell: ({ row }) => {
            const policies = row.getValue('policy') as IUser['policy'];
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
            const user = row.original as IUser;
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
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user._id)}>
                                    Copy user ID
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(user)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit user
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(user)}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete user
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

export default function UsersList() {
    const dispatch = useAppDispatch();
    const [data, setData] = React.useState<IUser[]>([]);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20, totalPages: 0 });
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const debouncedQuery = useDebounce(searchQuery, 500);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<IUser | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fetchUsers = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllUsersApi({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                search: debouncedQuery,
                ...(statusFilter !== 'all' && { status: statusFilter }),
            });
            if (response.data) {
                setData(response.data);
                setPagination((prev) => ({
                    ...prev,
                    totalPages: response.total_pages,
                }));
            }
        } catch (error: any) {
            setError(error?.response?.data?.message || 'Something went wrong while fetching roles.');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, debouncedQuery, statusFilter]);

    const fetchPolicies = React.useCallback(async () => {
        try {
            const policies = await getAllPoliciesApi();
            dispatch(setPolicies(policies));
        } catch (error: any) {
            showErrorToast(error);
        }
    }, []);

    React.useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    React.useEffect(() => {
        if (!isEditDialogOpen && !isCreateDialogOpen) return;
        fetchPolicies();
    }, [isEditDialogOpen, isCreateDialogOpen]);

    const handleCreate = async (data: CreateUserPayload | UpdateUserPayload) => {
        try {
            setIsSubmitting(true);
            await createUserApi(data as CreateUserPayload);
            setIsCreateDialogOpen(false);
            toast.success('User created successfully');
            fetchUsers();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (data: CreateUserPayload | UpdateUserPayload) => {
        if (!selectedUser) return;
        try {
            setIsSubmitting(true);
            await updateUserApi(selectedUser._id, data as UpdateUserPayload);
            setIsEditDialogOpen(false);
            setSelectedUser(null);
            toast.success('User updated successfully');
            fetchUsers();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            setIsSubmitting(true);
            await deleteUserApi(selectedUser._id);
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (user: IUser) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (user: IUser) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handlePaginationChange = (pageIndex: number, pageSize: number) => {
        setPagination((prev) => ({
            ...prev,
            pageIndex,
            pageSize,
        }));
    };

    const columns = createColumns(handleEdit, handleDeleteClick);

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage users and their access.</p>
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
                searchPlaceholder="Search users..."
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                pagination={pagination}
                onPaginationChange={handlePaginationChange}
                showColumnVisibility={true}
                showSearch={true}
                emptyMessage="No users found."
                loadingMessage="Loading users..."
                actionButtons={[
                    {
                        label: 'Create User',
                        onClick: () => setIsCreateDialogOpen(true),
                        icon: <PlusIcon className="mr-2 h-4 w-4" />,
                    },
                ]}
                filters={[
                    {
                        key: 'status',
                        label: 'Filter by Status',
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { label: 'All', value: 'all' },
                            { label: 'Active', value: 'Active' },
                            { label: 'Inactive', value: 'Inactive' },
                        ],
                    },
                ]}
            />

            {/* Create Dialog */}
            <UserDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreate}
                isLoading={isSubmitting}
            />

            {/* Edit Dialog */}
            <UserDialog
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setSelectedUser(null);
                }}
                onSubmit={handleUpdate}
                user={selectedUser}
                isLoading={isSubmitting}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setSelectedUser(null);
                }}
                onConfirm={handleDelete}
                title="Delete User"
                description={`Are you sure you want to delete "${selectedUser?.full_name}"? This action cannot be undone.`}
                isLoading={isSubmitting}
            />
        </div>
    );
}
