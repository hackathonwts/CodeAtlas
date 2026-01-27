'use client';

import { useEffect, useState } from 'react';
import { IChat } from '@/interfaces/chat.interface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit2, Trash2, MoreVertical, MessageSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import Select from 'react-select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { IProject } from '@/interfaces/project.interface';
import { projectsListApi } from '@/app/utils/apis/projects-api';
import { createChatApi } from '@/app/utils/apis/chat-api';
import { toast } from 'sonner';
import { showErrorToast } from '@/app/utils/error-handler';

interface ChatSidebarProps {
    chats: IChat[];
    selectedChat: IChat | null;
    onSelectChat: (chat: IChat) => void;
    onDeleteChat: (chatId: string) => void;
    onUpdateChatTitle: (chatId: string, newTitle: string) => void;
    onCreateChat: (chat: IChat) => void;
}

export function ChatSidebar({
    chats,
    selectedChat,
    onSelectChat,
    onDeleteChat,
    onUpdateChatTitle,
    onCreateChat,
}: ChatSidebarProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [projects, setProjects] = useState<Array<IProject>>([]);
    const [editingChat, setEditingChat] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [selectedProject, setSelectedProject] = useState<{ value: string | null; label: string | null } | null>(null);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleEditClick = (chat: IChat) => {
        setEditingChat(chat._id);
        setEditTitle(chat.title);
    };

    const handleSaveEdit = () => {
        if (editingChat && editTitle.trim()) {
            onUpdateChatTitle(editingChat, editTitle.trim());
        }
        setEditingChat(null);
        setEditTitle('');
    };

    const handleCancelEdit = () => {
        setEditingChat(null);
        setEditTitle('');
    };

    const handleDialogContinue = async () => {
        if (!selectedProject?.value || isCreating) return;
        try {
            setIsCreating(true);
            const newChat = await createChatApi({ project_id: selectedProject.value, title: newChatTitle });
            onCreateChat({
                ...newChat,
                project_id: { title: selectedProject?.label || '', _id: selectedProject?.value || '' },
            });
            setShowDialog(false);
            setSelectedProject(null);
            setNewChatTitle('');
        } catch (error: any) {
            showErrorToast(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDialogCancel = () => {
        setShowDialog(false);
        setSelectedProject(null);
        setNewChatTitle('');
    };

    const fetchProjects = async () => {
        try {
            const { data } = await projectsListApi({ page: 1, limit: 100 });
            setProjects(data);
        } catch (error: any) {
            showErrorToast(error);
        }
    };

    useEffect(() => {
        if (!showDialog) return;
        fetchProjects();
        return () => {
            setNewChatTitle('');
            setSelectedProject(null);
        };
    }, [showDialog]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-2 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Chats</h2>
                    <Button onClick={() => setShowDialog(true)} size="sm" className="h-8 w-8" variant="outline">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Input placeholder="Search chats..." className="flex-1 h-8 text-sm" />
                </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {/* Chats for this project */}
                    {chats.map((chat) => (
                        <div
                            key={chat._id}
                            className={cn(
                                'group relative rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors',
                                selectedChat?._id === chat._id && 'bg-accent border-primary',
                            )}
                            onClick={() => onSelectChat(chat)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 mb-1">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                                        {editingChat === chat._id ? (
                                            <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                                                <Input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="h-7 text-sm"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveEdit();
                                                        if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                    autoFocus
                                                />
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={handleSaveEdit}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <h3 className="font-medium text-sm truncate flex-1">{chat.title}</h3>
                                        )}
                                    </div>

                                    {editingChat !== chat._id && (
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="truncate">{chat.project_id.title}</span>
                                            <span className="text-[10px]">{moment(chat.updatedAt).fromNow()}</span>
                                        </div>
                                    )}
                                </div>

                                {editingChat !== chat._id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(chat);
                                                }}
                                            >
                                                <Edit2 className="h-3 w-3 mr-2" />
                                                Edit title
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive hover:text-destructive focus:bg-destructive/10 hover:bg-destructive/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteChat(chat._id);
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    ))}

                    {chats.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">No chats yet</p>
                            <p className="text-xs">Create a new chat to get started</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
            {/* Dialog Component */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select a Project</DialogTitle>
                        <DialogDescription>
                            Please choose a project from the dropdown below and click continue.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder="Chat title (optional)"
                            value={newChatTitle}
                            onChange={(e) => setNewChatTitle(e.target.value)}
                        />
                        <Select
                            onChange={setSelectedProject}
                            options={projects.map((project) => ({ value: project._id, label: project.title }))}
                            placeholder="Select a project..."
                            isClearable
                            isSearchable
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleDialogCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleDialogContinue} disabled={!selectedProject || isCreating}>
                            {isCreating ? 'Creating...' : 'Continue'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
