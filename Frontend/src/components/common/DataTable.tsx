import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type SortingState,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dataTableFeatures,
  type DataTableFeatures,
} from "@/components/ui/dataTableFeatures";
import { useState } from "react";

export type { DataTableFeatures } from "@/components/ui/dataTableFeatures";

export interface DataTableColumnMeta {
  className?: string;
}

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData, unknown>[];
  data: TData[];
  initialSorting?: SortingState;
  toolbar?: (table: TanStackTable<DataTableFeatures, TData>) => ReactNode;
  emptyMessage?: string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  initialSorting = [],
  toolbar,
  emptyMessage = "Không có dữ liệu phù hợp.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="flex w-full flex-col gap-3">
      {toolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {toolbar(table)}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xs">
        <Table>
          <TableHeader className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border/60 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    DataTableColumnMeta | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      className={clsx(
                        "py-3.5 text-xs font-semibold text-slate-600",
                        meta?.className,
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/50 transition-colors hover:bg-slate-50/70"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      DataTableColumnMeta | undefined;
                    return (
                      <TableCell
                        key={cell.id}
                        className={clsx("py-3.5 align-middle", meta?.className)}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-sm text-text-muted"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTable;

