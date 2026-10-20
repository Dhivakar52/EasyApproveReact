import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Mail, X } from "lucide-react";
import { DataTable } from "@/common/Datatable";
import { TableSearch } from "@/common/TableSearch";
import { Pagination } from "@/common/Pagination";
import CustomPanel from "@/common/CustomPanel";
import TableToolbarActions from "@/common/TableToolbarActions";
import { exportToCsv } from "@/lib/utils";
import { Field, SelectField } from "@/components/FormPrimitives";
import { useTable } from "@/hooks/useTable";
import { MOCK_RECOGNITIONS, type RecognitionItem } from "@/mocks/awards.mock";

const RecognitionList = () => {
  const [recognitions] = useState<RecognitionItem[]>(MOCK_RECOGNITIONS);

  const {
    search,
    setSearch,
    isFilterOpen,
    openFilter,
    closeFilter,
    tempFilters,
    appliedFilters,
    setFilterField,
    applyFilters,
    resetFilters,
    clearSingleFilter,
    hasActiveFilters,
    paginatedData,
    totalRecords,
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useTable<RecognitionItem>({
    data: recognitions,
    searchFields: ["awardName", "winner"],
    initialPageSize: 10,
    filterPredicate: (item, filters) => {
      if (filters.certificate) {
        if (filters.certificate === "Issued" && !item.certificateIssued) return false;
        if (filters.certificate === "Not Issued" && item.certificateIssued) return false;
      }
      return true;
    },
  });

  const handleDownloadCertificate = (id: string) => {
    console.log("Download certificate for:", id);
  };

  const handleSendEmail = (id: string) => {
    console.log("Send email for:", id);
  };

  const columns = useMemo<ColumnDef<RecognitionItem>[]>(
    () => [
      {
        accessorKey: "awardName",
        header: "Award Name",
        cell: (info) => (
          <span className="text-sm font-medium text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "winner",
        header: "Winner",
        cell: (info) => (
          <span className="text-sm text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "certificateIssued",
        header: "Certificate Issued",
        cell: (info) => {
          const issued = Boolean(info.getValue());
          return issued ? (
            <span className="text-green-600 font-medium text-sm">Yes</span>
          ) : (
            <span className="text-red-600 font-medium text-sm">No</span>
          );
        },
      },
      {
        id: "download",
        header: "Actions",
        cell: ({ row }) => {
          const recognition = row.original;
          return recognition.certificateIssued ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadCertificate(recognition.id)}
                className="px-3 py-1.5 border border-orange-500 text-orange-500 rounded text-xs font-medium hover:bg-orange-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Certificates
              </button>
              <button
                type="button"
                onClick={() => handleSendEmail(recognition.id)}
                className="px-3 py-1.5 border border-blue-500 text-blue-500 rounded text-xs font-medium hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="py-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Recognition List
            </h2>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {totalRecords} Records
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by name or award..."
              className="w-64"
            />
            {/* Standardized Toolbar Actions (Filter / Export / Print) */}
            <TableToolbarActions
              onOpenFilter={openFilter}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={resetFilters}
              onExport={() => exportToCsv(paginatedData as unknown as Record<string, unknown>[], "recognition-list.csv")}
              exportTitle="Export Recognitions"
            />
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-xs text-gray-500 font-medium">Filters:</span>
            {Object.entries(appliedFilters).map(([key, val]) => {
              if (!val) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                >
                  <span className="capitalize">{key}:</span>
                  <span className="font-semibold">{val}</span>
                  <button
                    type="button"
                    onClick={() => clearSingleFilter(key)}
                    className="hover:text-red-500 ml-0.5 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Reusable DataTable */}
        <DataTable
          columns={columns}
          data={paginatedData}
          headerClassName="bg-gray-50 border-b border-gray-200"
          headCellClassName="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
          cellClassName="px-6 py-4"
          rowClassName="hover:bg-gray-50 transition-colors"
        />

        {/* Pagination Toolbar */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>

        {/* Shared CustomPanel for Filters */}
        <CustomPanel
          isOpen={isFilterOpen}
          onClose={closeFilter}
          title="Filter Recognitions"
          width="400px"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeFilter}
                  className="px-3.5 py-2 text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <Field label="Certificate Status">
              <SelectField
                placeholder="All Certificates"
                value={tempFilters.certificate ?? ""}
                onChange={(val) => setFilterField("certificate", val)}
                options={["Issued", "Not Issued"]}
              />
            </Field>
          </div>
        </CustomPanel>
      </div>
    </div>
  );
};

export default RecognitionList;