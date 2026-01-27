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
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, PlusIcon, RefreshCw } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { INotificationTemplate } from '@/interfaces/notification-template.interface';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    getAllTemplatesApi,
    createOrUpdateTemplateApi,
    deleteTemplateApi,
    seedTemplatesApi,
    CreateTemplatePayload,
} from '@/app/utils/apis/notification-template-api';
import { TemplateDialog } from './template-dialog';
import { DeleteDialog } from '../projects/delete-dialog';
import { formatDistance } from 'date-fns';
import { showErrorToast } from '@/app/utils/error-handler';

const createColumns = (onEdit: (template: INotificationTemplate) => void, onDelete: (template: INotificationTemplate) => void): ColumnDef<INotificationTemplate>[] => [
    {
        accessorKey: 'key',
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Template Key
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="text-center font-mono text-sm">
                <Badge variant="outline">{row.getValue('key')}</Badge>
            </div>
        ),
    },
    {
        accessorKey: 'title',
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'body',
        header: () => <div className="text-center">Body</div>,
        cell: ({ row }) => (
            <div className="text-center text-sm text-muted-foreground max-w-md truncate">
                {row.getValue('body')}
            </div>
        ),
    },
    {
        accessorKey: 'version',
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Version
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="text-center">v{row.getValue('version')}</div>,
    },
    {
        accessorKey: 'is_active',
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean;
            return (
                <div className="flex justify-center">
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'updatedAt',
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Last Updated
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            const date = row.getValue('updatedAt') as string;
            return <div className="text-center">{formatDistance(new Date(date), new Date(), { addSuffix: true })}</div>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const template = row.original;
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => onEdit(template)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(template)} className="text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

export default function NotificationTemplatesPage() {
    const [templates, setTemplates] = React.useState<INotificationTemplate[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [selectedTemplate, setSelectedTemplate] = React.useState<INotificationTemplate | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSeedingLoading, setIsSeedingLoading] = React.useState(false);

    const fetchTemplates = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getAllTemplatesApi();
            setTemplates(data);
        } catch (error) {
            showErrorToast(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // const handleCreate = () => {
    //     setSelectedTemplate(null);
    //     setIsDialogOpen(true);
    // };

    const handleEdit = (template: INotificationTemplate) => {
        setSelectedTemplate(template);
        setIsDialogOpen(true);
    };

    const handleDelete = (template: INotificationTemplate) => {
        setSelectedTemplate(template);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (data: CreateTemplatePayload) => {
        try {
            setIsSubmitting(true);
            await createOrUpdateTemplateApi(data);
            toast.success(selectedTemplate ? 'Template updated successfully' : 'Template created successfully');
            setIsDialogOpen(false);
            setSelectedTemplate(null);
            await fetchTemplates();
        } catch (error) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedTemplate) return;

        try {
            setIsSubmitting(true);
            await deleteTemplateApi(selectedTemplate.key);
            toast.success('Template deleted successfully');
            setIsDeleteDialogOpen(false);
            setSelectedTemplate(null);
            await fetchTemplates();
        } catch (error) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSeedTemplates = async () => {
        try {
            setIsSeedingLoading(true);
            const result = await seedTemplatesApi();
            toast.success(`${result.message} (${result.count} templates)`);
            await fetchTemplates();
        } catch (error) {
            showErrorToast(error);
        } finally {
            setIsSeedingLoading(false);
        }
    };

    const columns = createColumns(handleEdit, handleDelete);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Notification Templates</h1>
                    <p className="text-muted-foreground">
                        Manage notification templates with dynamic variable support
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSeedTemplates} variant="outline" disabled={isSeedingLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isSeedingLoading ? 'animate-spin' : ''}`} />
                        Seed Templates
                    </Button>
                    {/* <Button onClick={handleCreate}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Template
                    </Button> */}
                </div>
            </div>

            <DataTable columns={columns} data={templates} isLoading={isLoading} searchPlaceholder="Search templates..." />

            <TemplateDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleSubmit}
                template={selectedTemplate}
                isLoading={isSubmitting}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Template"
                description={`Are you sure you want to delete the template "${selectedTemplate?.key}"? This action cannot be undone.`}
                isLoading={isSubmitting}
            />
        </div>
    );
}
