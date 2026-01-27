'use client';

import * as React from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Loader2 } from 'lucide-react';

interface ActionButton {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
}

interface FilterOption {
    label: string;
    value: string;
}

interface Filter {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    pagination?: {
        pageIndex: number;
        pageSize: number;
        totalPages?: number;
        totalCount?: number;
    };
    onPaginationChange?: (pageIndex: number, pageSize: number) => void;
    showColumnVisibility?: boolean;
    showSearch?: boolean;
    emptyMessage?: string;
    loadingMessage?: string;
    containerClassName?: string;
    tableContainerClassName?: string;
    manualPagination?: boolean;
    manualFiltering?: boolean;
    manualSorting?: boolean;
    showRowSelection?: boolean;
    actionButtons?: ActionButton[];
    filters?: Filter[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    searchPlaceholder = 'Search...',
    searchValue = '',
    onSearchChange,
    pagination,
    onPaginationChange,
    showColumnVisibility = true,
    showSearch = true,
    emptyMessage = 'No results.',
    loadingMessage = 'Loading...',
    containerClassName = '',
    tableContainerClassName = 'h-[calc(100vh-280px)]',
    manualPagination = true,
    manualFiltering = true,
    manualSorting = true,
    showRowSelection = false,
    actionButtons = [],
    filters = [],
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const pageCount = pagination?.totalPages ?? 0;
    const pageIndex = pagination?.pageIndex ?? 0;
    const pageSize = pagination?.pageSize ?? 10;

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        manualPagination,
        manualFiltering,
        manualSorting,
        pageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex,
                pageSize,
            },
        },
    });

    const handlePreviousPage = () => {
        if (onPaginationChange) {
            onPaginationChange(pageIndex - 1, pageSize);
        }
    };

    const handleNextPage = () => {
        if (onPaginationChange) {
            onPaginationChange(pageIndex + 1, pageSize);
        }
    };

    return (
        <div className={containerClassName}>
            {(showSearch || showColumnVisibility || actionButtons.length > 0 || filters.length > 0) && (
                <div className="flex items-center justify-between py-4 gap-4">
                    <div className="flex items-center gap-2">
                        {actionButtons.map((button, index) => (
                            <Button key={index} onClick={button.onClick} variant={button.variant || 'default'}>
                                {button.icon}
                                {button.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                        {filters.map((filter) => (
                            <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
                                <SelectTrigger className="w-45">
                                    <SelectValue placeholder={filter.label} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filter.options.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}

                        {showSearch && (
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(event) => onSearchChange?.(event.target.value)}
                                className="w-45"
                            />
                        )}
                    </div>

                    {showColumnVisibility && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                >
                                                    {column.id.replace(/_/g, ' ')}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            )}

            <div className={`overflow-hidden rounded-md border flex flex-col ${tableContainerClassName}`}>
                <Table className="flex-1">
                    <TableHeader className="sticky top-0 bg-background z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-full text-center">
                                    <div className="flex items-center justify-center py-32">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        <span>{loadingMessage}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {showRowSelection && (
                        <span>
                            {table.getFilteredSelectedRowModel().rows.length} of{' '}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </span>
                    )}
                    {pagination && !showRowSelection && (
                        <span>
                            Page {pageIndex + 1} of {pageCount || 1}
                            {pagination.totalCount && ` (${pagination.totalCount} total)`}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {pagination && (
                        <span className="text-sm text-muted-foreground">
                            Page {pageIndex + 1} of {pageCount || 1}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!pagination || pageIndex === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!pagination || pageIndex >= pageCount - 1}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
