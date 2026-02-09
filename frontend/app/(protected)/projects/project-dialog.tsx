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
import { IProject } from '@/interfaces/project.interface';
import { CreateProjectPayload } from '@/app/utils/apis/projects-api';
import { Eye, EyeOff } from 'lucide-react';

interface ProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateProjectPayload) => Promise<void>;
    project?: IProject | null;
    isLoading?: boolean;
}

export function ProjectDialog({ open, onOpenChange, onSubmit, project, isLoading = false }: ProjectDialogProps) {
    const [showPassword, setShowPassword] = React.useState(false)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateProjectPayload>({
        defaultValues: project
            ? {
                title: project.title,
                description: project.description || '',
                language: project.language || '',
                git_link: project.git_link || '',
                git_username: project.git_username || '',
                git_password: project.git_password || '',
                git_branch: project.git_branch || '',
            }
            : {
                title: '',
                description: '',
                language: '',
                git_link: '',
                git_username: '',
                git_password: '',
                git_branch: '',
            },
    });

    React.useEffect(() => {
        if (project) {
            reset({
                title: project.title,
                description: project.description || '',
                language: project.language || '',
                git_link: project.git_link || '',
                git_username: project.git_username || '',
                git_password: project.git_password || '',
                git_branch: project.git_branch || '',
            });
        } else {
            reset({
                title: '',
                description: '',
                language: '',
                git_link: '',
            });
        }
    }, [project, reset]);

    const onFormSubmit = async (data: CreateProjectPayload) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-131.25" onInteractOutside={(e) => { e.preventDefault(); }}>
                <DialogHeader>
                    <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
                    <DialogDescription>
                        {project ? 'Edit the project details below.' : 'Add a new project to your workspace.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                {...register('title', { required: 'Title is required' })}
                                placeholder="Enter project title"
                            />
                            {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                {...register('description')}
                                placeholder="Enter project description"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="language">Language</Label>
                            <Input id="language" {...register('language')} placeholder="e.g., TypeScript, Python" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="git_link">
                                Git Link <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="git_link"
                                type="url"
                                {...register('git_link', {
                                    required: 'Git link is required',
                                    pattern: {
                                        value: /^https?:\/\/.+/,
                                        message: 'Please enter a valid URL',
                                    },
                                })}
                                placeholder="https://github.com/username/repo"
                            />
                            {errors.git_link && <span className="text-sm text-red-500">{errors.git_link.message}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="git_username">Git Username <span className="text-red-500">*</span></Label>
                            <Input
                                id="git_username"
                                autoComplete='off'
                                {...register('git_username')}
                                placeholder="Enter Git username"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="git_password">Git Password <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    id="git_password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete='off'
                                    {...register('git_password')}
                                    placeholder="Enter Git password"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="git_branch">Git Branch <span className="text-red-500">*</span></Label>
                            <Input
                                id="git_branch"
                                {...register('git_branch')}
                                placeholder="e.g., main, master"
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
                            {isLoading ? 'Saving...' : project ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
