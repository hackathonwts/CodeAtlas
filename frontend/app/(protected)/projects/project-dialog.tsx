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

interface ProjectFormData {
    title: string;
    description?: string;
    language?: string;
    git_link: string;
}

interface ProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    project?: IProject | null;
    isLoading?: boolean;
}

export function ProjectDialog({ open, onOpenChange, onSubmit, project, isLoading = false }: ProjectDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProjectFormData>({
        defaultValues: project
            ? {
                  title: project.title,
                  description: project.description || '',
                  language: project.language || '',
                  git_link: project.git_link || '',
              }
            : {
                  title: '',
                  description: '',
                  language: '',
                  git_link: '',
              },
    });

    React.useEffect(() => {
        if (project) {
            reset({
                title: project.title,
                description: project.description || '',
                language: project.language || '',
                git_link: project.git_link || '',
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

    const onFormSubmit = async (data: ProjectFormData) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-131.25">
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
