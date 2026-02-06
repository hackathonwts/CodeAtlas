"use client";

import ReactMarkdown from 'react-markdown';
import Highlight from 'react-highlight';
import 'highlight.js/styles/github-dark.css';
import { JSX } from 'react';

export function Markdown({ content }: { content: string }): JSX.Element {
    return (
        <ReactMarkdown
            components={{
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    if (match) {
                        const language = match[1];
                        console.log("language: ", language);
                        return (
                            <div className="my-2 rounded overflow-hidden text-sm">
                                <Highlight className={language}>
                                    {codeString}
                                </Highlight>
                            </div>
                        );
                    }
                    return (
                        <code className="bg-black/60 px-2 py-1 rounded text-sm inline">
                            {children}
                        </code>
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
            {content}
        </ReactMarkdown>
    )
}