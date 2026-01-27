'use client';

import * as React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setProjects, addProject, updateProject, removeProject, setProjectsLoading } from '@/app/store/projectSlice';
import {
    projectsListApi,
    createProjectApi,
    updateProjectApi,
    deleteProjectApi,
    CreateProjectPayload,
    UpdateProjectPayload,
} from '@/app/utils/apis/projects-api';
import { DataTable } from '@/components/data-table';
import { ProjectDialog } from './project-dialog';
import { DeleteDialog } from './delete-dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { IProject } from '@/interfaces/project.interface';
import { toast } from 'sonner';
import { useDebounce } from '@/app/utils/debouncer';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { formatDistance } from 'date-fns';
import { showErrorToast } from '@/app/utils/error-handler';

export const createColumns = (
    onEdit: (project: IProject) => void,
    onDelete: (project: IProject) => void,
): ColumnDef<IProject>[] => [
    {
        id: 'avatar',
        header: 'Project',
        cell: ({ row }) => {
            const title = row.original.title;
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
        accessorKey: 'title',
        header: () => <div className="text-center">Title</div>,
        cell: ({ row }) => {
            return (
                <div className="flex flex-col justify-center text-center">
                    <span className="font-medium">{row.getValue('title')}</span>
                    {row.original.description && (
                        <span className="text-sm text-muted-foreground line-clamp-1">{row.original.description}</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'language',
        header: 'Language',
        cell: ({ row }) => {
            const language = row.getValue('language') as string;
            return language ? (
                <Badge variant="secondary">{language}</Badge>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: 'git_link',
        header: 'Git Link',
        cell: ({ row }) => {
            const gitLink = row.getValue('git_link') as string;
            return (
                <a
                    href={gitLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline max-w-xs truncate block"
                >
                    {gitLink}
                </a>
            );
        },
    },
    {
        accessorKey: 'created_by',
        header: 'Created By',
        cell: ({ row }) => {
            const createdBy = row.original.created_by;
            return createdBy ? (
                <div className="flex flex-col">
                    <span className="text-sm">{createdBy.full_name}</span>
                    <span className="text-xs text-muted-foreground">{createdBy.email}</span>
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string;
            return date ? (
                <span className="text-sm text-muted-foreground">
                    {formatDistance(new Date(date), new Date(), { addSuffix: true })}
                </span>
            ) : (
                '-'
            );
        },
    },
    {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
            const project = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project._id)}>
                            Copy project ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(project)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(project)} className="text-red-600">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function ProjectsPage() {
    const dispatch = useAppDispatch();
    const { projects, isProjectsLoading } = useAppSelector((state) => state.project);

    const [searchValue, setSearchValue] = React.useState('');
    const [languageFilter, setLanguageFilter] = React.useState('all');
    const debouncedSearch = useDebounce(searchValue, 500);
    const [error, setError] = React.useState<string | null>(null);

    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
        totalPages: 1,
        totalCount: 0,
    });

    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState<IProject | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Fetch projects
    const fetchProjects = React.useCallback(async () => {
        try {
            setError(null);
            dispatch(setProjectsLoading(true));
            const response = await projectsListApi({
                page: (pagination.pageIndex + 1) as any,
                limit: pagination.pageSize as any,
                search: debouncedSearch,
                ...(languageFilter !== 'all' && { language: languageFilter }),
            });
            dispatch(setProjects(response.data));
            setPagination((prev) => ({
                ...prev,
                totalPages: response.total_pages,
                totalCount: response.total_count,
            }));
        } catch (error: any) {
            setError(error.response?.data?.message || 'An error occurred while fetching projects.');
        } finally {
            dispatch(setProjectsLoading(false));
        }
    }, [dispatch, pagination.pageIndex, pagination.pageSize, debouncedSearch, languageFilter]);

    React.useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Create project
    const handleCreate = async (data: CreateProjectPayload) => {
        try {
            setIsSubmitting(true);
            const newProject = await createProjectApi(data);
            dispatch(addProject(newProject));
            setIsCreateDialogOpen(false);
            toast.success('Project created successfully');
            fetchProjects();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update project
    const handleUpdate = async (data: UpdateProjectPayload) => {
        if (!selectedProject) return;
        try {
            setIsSubmitting(true);
            const updatedProject = await updateProjectApi(selectedProject._id, data);
            dispatch(updateProject({ projectId: selectedProject._id, updates: updatedProject }));
            setIsEditDialogOpen(false);
            setSelectedProject(null);
            toast.success('Project updated successfully');
            fetchProjects();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete project
    const handleDelete = async () => {
        if (!selectedProject) return;
        try {
            setIsSubmitting(true);
            await deleteProjectApi(selectedProject._id);
            dispatch(removeProject(selectedProject._id));
            setIsDeleteDialogOpen(false);
            setSelectedProject(null);
            toast.success('Project deleted successfully');
            fetchProjects();
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit
    const handleEdit = (project: IProject) => {
        setSelectedProject(project);
        setIsEditDialogOpen(true);
    };

    // Handle delete
    const handleDeleteClick = (project: IProject) => {
        setSelectedProject(project);
        setIsDeleteDialogOpen(true);
    };

    // Handle pagination
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
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your projects and their configurations.</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
                    {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={projects}
                isLoading={isProjectsLoading}
                searchPlaceholder="Search projects..."
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                pagination={pagination}
                onPaginationChange={handlePaginationChange}
                showColumnVisibility={true}
                showSearch={true}
                emptyMessage="No projects found."
                loadingMessage="Loading projects..."
                actionButtons={[
                    {
                        label: 'Create Project',
                        onClick: () => setIsCreateDialogOpen(true),
                        icon: <PlusIcon className="mr-2 h-4 w-4" />,
                    },
                ]}
                filters={[
                    {
                        key: 'language',
                        label: 'Filter by Language',
                        value: languageFilter,
                        onChange: setLanguageFilter,
                        options: [
                            { label: 'All Languages', value: 'all' },
                            { label: 'TypeScript', value: 'TypeScript' },
                            { label: 'JavaScript', value: 'JavaScript' },
                            { label: 'Python', value: 'Python' },
                            { label: 'Java', value: 'Java' },
                            { label: 'Go', value: 'Go' },
                            { label: 'Rust', value: 'Rust' },
                        ],
                    },
                ]}
            />

            {/* Create Dialog */}
            <ProjectDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreate}
                isLoading={isSubmitting}
            />

            {/* Edit Dialog */}
            <ProjectDialog
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setSelectedProject(null);
                }}
                onSubmit={handleUpdate}
                project={selectedProject}
                isLoading={isSubmitting}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setSelectedProject(null);
                }}
                onConfirm={handleDelete}
                title="Delete Project"
                description={`Are you sure you want to delete "${selectedProject?.title}"? This action cannot be undone.`}
                isLoading={isSubmitting}
            />
        </div>
    );
}
