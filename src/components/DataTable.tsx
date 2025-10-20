// components/DataTable.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  exportRender?: (item: T) => string | number;
}

export interface Filter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface DateFilter {
  key: string;
  label: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  dateFilter?: DateFilter;
  searchPlaceholder?: string;
  searchKeys?: string[];
  itemsPerPage?: number;
  exportFileName?: string;
  onRowClick?: (item: T) => void;
  renderActions?: (item: T) => React.ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  dateFilter,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  itemsPerPage = 5,
  exportFileName = 'data',
  onRowClick,
  renderActions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter((item) => String(item[key]) === value);
      }
    });

    // Apply date range filter
    if (dateFilter && (dateRange.start || dateRange.end)) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item[dateFilter.key]);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          return itemDate >= startDate;
        } else if (endDate) {
          return itemDate <= endDate;
        }
        return true;
      });
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((item) => {
        if (searchKeys.length === 0) {
          return Object.values(item).some((val) =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return searchKeys.some((key) =>
          String(item[key]).toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, activeFilters, dateRange, searchQuery, sortConfig, searchKeys, dateFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const formatDateRange = () => {
    if (dateRange.start && dateRange.end) {
      return `${new Date(dateRange.start).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short' 
      })} - ${new Date(dateRange.end).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short' 
      })}`;
    } else if (dateRange.start) {
      return `From ${new Date(dateRange.start).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      })}`;
    } else if (dateRange.end) {
      return `Until ${new Date(dateRange.end).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      })}`;
    }
    return dateFilter?.label || 'Filter by Date';
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredData.map((item) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        if (col.exportRender) {
          row[col.label] = col.exportRender(item);
        } else {
          row[col.label] = item[col.key];
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const tableData = filteredData.map((item) => {
      return columns.map((col) => {
        if (col.exportRender) {
          return col.exportRender(item);
        }
        return item[col.key];
      });
    });

    autoTable(doc, {
      head: [columns.map((col) => col.label)],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`${exportFileName}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={activeFilters[filter.key] || 'all'}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}

          {/* Date Filter Dropdown */}
          {dateFilter && (
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
                  dateRange.start || dateRange.end
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="whitespace-nowrap">{formatDateRange()}</span>
                {(dateRange.start || dateRange.end) && (
                  <X
                    className="w-4 h-4 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDateFilter();
                    }}
                  />
                )}
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => handleDateRangeChange('start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => handleDateRangeChange('end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={clearDateFilter}
                        className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Buttons */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">PDF</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={`text-left py-3 px-4 font-semibold text-gray-700 text-sm ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-indigo-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {renderActions && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                    className="text-center py-8 text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="py-4 px-4">
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {renderActions && (
                      <td className="py-4 px-4">{renderActions(item)}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4 gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{' '}
            {filteredData.length} entries
          </p>
          
          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="rows-per-page" className="text-sm text-gray-600">
              Rows per page:
            </label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 rounded-lg transition text-sm ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
