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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { INotificationTemplate, NotificationTemplateKey } from '@/interfaces/notification-template.interface';
import { Info } from 'lucide-react';

interface TemplateFormData {
    key: NotificationTemplateKey;
    version?: number;
    title: string;
    body: string;
    is_active: boolean;
}

interface TemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: TemplateFormData) => Promise<void>;
    template?: INotificationTemplate | null;
    isLoading?: boolean;
}

const templateKeys: NotificationTemplateKey[] = [
    'PROJECT_CREATED',
    'PROJECT_UPDATED',
    'PROJECT_DELETED',
    'MEMBER_ADDED',
    'MEMBER_REMOVED',
    'USER_CREATED',
    'USER_UPDATED',
];

export function TemplateDialog({ open, onOpenChange, onSubmit, template, isLoading = false }: TemplateDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TemplateFormData>({
        defaultValues: template
            ? {
                  key: template.key,
                //   version: template.version,
                  title: template.title,
                  body: template.body,
                  is_active: template.is_active,
              }
            : {
                  key: 'PROJECT_CREATED',
                //   version: 1,
                  title: '',
                  body: '',
                  is_active: true,
              },
    });

    const keyValue = watch('key');
    const isActiveValue = watch('is_active');

    React.useEffect(() => {
        if (template) {
            reset({
                key: template.key,
                // version: template.version,
                title: template.title,
                body: template.body,
                is_active: template.is_active,
            });
        } else {
            reset({
                key: 'PROJECT_CREATED',
                // version: 1,
                title: '',
                body: '',
                is_active: true,
            });
        }
    }, [template, reset]);

    const onFormSubmit = async (data: TemplateFormData) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template ? 'Edit Template' : 'Create Template'}</DialogTitle>
                    <DialogDescription>
                        {template
                            ? 'Update the notification template details below.'
                            : 'Create a new notification template with dynamic variables.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="key">
                                Template Key <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={keyValue}
                                onValueChange={(value) => setValue('key', value as NotificationTemplateKey)}
                                disabled={!!template}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select template key" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templateKeys.map((key) => (
                                        <SelectItem key={key} value={key}>
                                            {key}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.key && <span className="text-sm text-red-500">{errors.key.message}</span>}
                        </div>

                        {/* <div className="grid gap-2">
                            <Label htmlFor="version">
                                Version <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="version"
                                type="number"
                                {...register('version', {
                                    required: 'Version is required',
                                    min: { value: 1, message: 'Version must be at least 1' },
                                })}
                                placeholder="1"
                            />
                            {errors.version && <span className="text-sm text-red-500">{errors.version.message}</span>}
                        </div> */}

                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                {...register('title', {
                                    required: 'Title is required',
                                    maxLength: { value: 100, message: 'Title cannot exceed 100 characters' },
                                })}
                                placeholder="Enter notification title"
                            />
                            {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="body">
                                Body <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="body"
                                {...register('body', {
                                    required: 'Body is required',
                                    maxLength: { value: 500, message: 'Body cannot exceed 500 characters' },
                                })}
                                placeholder="Enter notification body. Use {{variableName}} for dynamic content."
                                rows={4}
                            />
                            {errors.body && <span className="text-sm text-red-500">{errors.body.message}</span>}
                            <div className="flex items-start gap-2 p-2 bg-muted rounded-md">
                                <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                    Use double curly braces for variables. Example: "Hello {'{{userName}}'}, your project {'{{projectName}}'} was created."
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Active Status
                            </Label>
                            <Switch
                                id="is_active"
                                checked={isActiveValue}
                                onCheckedChange={(checked: boolean) => setValue('is_active', checked)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
