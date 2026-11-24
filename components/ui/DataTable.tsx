"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { useLanguage } from "@/lib/LanguageContext";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder,
  pageSize = 8,
  onRowClick,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const resolvedSearchPlaceholder = searchPlaceholder || t("searchPlaceholder");
  const resolvedEmptyTitle = emptyTitle || t("tableNoRecords");
  const resolvedEmptyDescription = emptyDescription || t("tableNoEntriesFilter");

  // Client-side search filtering
  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((val) =>
      String(val ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full space-y-3">
      {/* Search Bar & Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder={resolvedSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <p className="text-xs text-slate-500 self-end sm:self-center">
          {t("tableShowing")} <strong>{paginatedData.length}</strong> {t("tableOf")} <strong>{filteredData.length}</strong> {t("tableResults")}
        </p>
      </div>

      {/* Responsive Table */}
      <div className="rounded border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50/50"
                    }`}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3">
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? "-")
                          : null}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center">
                    <EmptyState
                      title={resolvedEmptyTitle}
                      description={resolvedEmptyDescription}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs">
            <span className="text-slate-600">
              {t("tablePage")} {currentPage} {t("tableOf")} {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                {t("prev")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                {t("next")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
