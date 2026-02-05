'use client';

import { useState, useRef, useEffect } from 'react';
import { IChat, IConversation } from '@/interfaces/chat.interface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, User, Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import { useAppDispatch } from '@/app/store/hooks';
import { setCurrentChat } from '@/app/store/chatSlice';

interface ChatConversationProps {
    selectedChat: IChat;
    conversations: IConversation[];
    onSendMessage: (message: string, onStreamUpdate?: (content: string) => void) => Promise<void>;
}

export function ChatConversation({ selectedChat, conversations, onSendMessage }: ChatConversationProps) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations, streamingContent]);

    const handleSendMessage = async () => {
        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        setStreamingContent('');
        const currentMessage = message;
        setMessage('');

        await onSendMessage(currentMessage, (content) => {
            setStreamingContent(content);
        });

        setStreamingContent('');
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const handleCloseChat = () => dispatch(setCurrentChat(null));

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Chat Header */}
            <div className="border-b bg-background p-2 shrink-0">
                <div className="flex items-center">
                    <div className="flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                                {selectedChat.title?.charAt(0).toUpperCase() || 'P'}
                            </span>
                        </div>
                    </div>
                    <div className="ml-0 flex-1">
                        <h1 className="font-semibold text-lg ml-2">{selectedChat.title}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                                {selectedChat.project_id.title}
                            </Badge>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCloseChat}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {conversations.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <div className="rounded-lg p-6 max-w-md mx-auto">
                                    <Bot className="h-12 w-12 mx-auto mb-4" />
                                    <h3 className="font-medium mb-2">Start a conversation</h3>
                                    <p className="text-sm">
                                        Ask questions about your code, request help with debugging, or explore new
                                        features.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            conversations.map((conversation) => (
                                <div
                                    key={conversation._id}
                                    className={cn(
                                        'flex gap-3 max-w-[85%] w-fit',
                                        conversation.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
                                    )}
                                >
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback
                                            className={cn(
                                                'text-xs',
                                                conversation.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-secondary-foreground',
                                            )}
                                        >
                                            {conversation.role === 'user' ? (
                                                <User className="h-4 w-4" />
                                            ) : (
                                                <Bot className="h-4 w-4" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div
                                        className={cn(
                                            'flex flex-col',
                                            conversation.role === 'user' ? 'items-end' : 'items-start',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'rounded-lg px-4 py-2 max-w-full min-w-0 overflow-hidden wrap-break-word',
                                                conversation.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted',
                                            )}
                                        >
                                            {conversation.role === 'assistant' ? (
                                                <div className="prose prose-sm max-w-none dark:prose-invert wrap-break-word overflow-hidden">
                                                    <ReactMarkdown
                                                        components={{
                                                            code({ node, className, children, ...props }) {
                                                                return (
                                                                    <pre className="bg-background/50 rounded p-2 text-sm whitespace-pre-wrap wrap-break-word overflow-hidden">
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                );
                                                            },
                                                            p({ children }) {
                                                                return <p className="mb-2 last:mb-0">{children}</p>;
                                                            },
                                                            h3({ children }) {
                                                                return (
                                                                    <h3 className="text-sm font-semibold mt-3 mb-2 first:mt-0">
                                                                        {children}
                                                                    </h3>
                                                                );
                                                            },
                                                            ul({ children }) {
                                                                return (
                                                                    <ul className="list-disc list-inside mb-2 space-y-1">
                                                                        {children}
                                                                    </ul>
                                                                );
                                                            },
                                                            ol({ children }) {
                                                                return (
                                                                    <ol className="list-decimal list-inside mb-2 space-y-1">
                                                                        {children}
                                                                    </ol>
                                                                );
                                                            },
                                                            li({ children }) {
                                                                return <li className="text-sm">{children}</li>;
                                                            },
                                                            blockquote({ children }) {
                                                                return (
                                                                    <blockquote className="border-l-2 border-muted-foreground/25 pl-3 italic text-muted-foreground mb-2">
                                                                        {children}
                                                                    </blockquote>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {conversation.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                                    {conversation.content}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-1 px-1">
                                            {moment(conversation.createdAt).format('h:mm A')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%] mr-auto">
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                {streamingContent ? (
                                    <div className="flex flex-col items-start">
                                        <div className="bg-muted rounded-lg px-4 py-2 max-w-full min-w-0 overflow-hidden wrap-break-word">
                                            <div className="prose prose-sm max-w-none dark:prose-invert wrap-break-word overflow-hidden">
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, className, children, ...props }) {
                                                            return (
                                                                <pre className="bg-background/50 rounded p-2 text-sm whitespace-pre-wrap wrap-break-word overflow-hidden">
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                </pre>
                                                            );
                                                        },
                                                        p({ children }) {
                                                            return <p className="mb-2 last:mb-0">{children}</p>;
                                                        },
                                                        h3({ children }) {
                                                            return (
                                                                <h3 className="text-sm font-semibold mt-3 mb-2 first:mt-0">
                                                                    {children}
                                                                </h3>
                                                            );
                                                        },
                                                        ul({ children }) {
                                                            return (
                                                                <ul className="list-disc list-inside mb-2 space-y-1">
                                                                    {children}
                                                                </ul>
                                                            );
                                                        },
                                                        ol({ children }) {
                                                            return (
                                                                <ol className="list-decimal list-inside mb-2 space-y-1">
                                                                    {children}
                                                                </ol>
                                                            );
                                                        },
                                                        li({ children }) {
                                                            return <li className="text-sm">{children}</li>;
                                                        },
                                                        blockquote({ children }) {
                                                            return (
                                                                <blockquote className="border-l-2 border-muted-foreground/25 pl-3 italic text-muted-foreground mb-2">
                                                                    {children}
                                                                </blockquote>
                                                            );
                                                        },
                                                    }}
                                                >
                                                    {streamingContent}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-1 px-1 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 bg-current rounded-full animate-pulse"></span>
                                            Typing...
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-muted rounded-lg px-4 py-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                                            <div
                                                className="w-2 h-2 bg-current rounded-full animate-pulse"
                                                style={{ animationDelay: '0.2s' }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-current rounded-full animate-pulse"
                                                style={{ animationDelay: '0.4s' }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t bg-background p-4 shrink-0">
                <div className="flex space-x-2">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim() || isLoading} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
