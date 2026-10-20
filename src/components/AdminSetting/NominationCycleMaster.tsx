import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Menu, X } from "lucide-react";
import BackToSetting from "../BackToSetting";
import { DataTable } from "@/common/Datatable";
import { TableSearch } from "@/common/TableSearch";
import { Pagination } from "@/common/Pagination";
import CustomPanel from "@/common/CustomPanel";
import TableToolbarActions from "@/common/TableToolbarActions";
import { exportToCsv } from "@/lib/utils";
import { Field, SelectField } from "@/components/FormPrimitives";
import { useTable } from "@/hooks/useTable";
import { MOCK_CYCLES, type NominationCycleItem } from "@/mocks/adminMaster.mock";

const NominationCycleMaster = () => {
  const [cycles] = useState<NominationCycleItem[]>(MOCK_CYCLES);

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
  } = useTable<NominationCycleItem>({
    data: cycles,
    searchFields: ["cycleName", "duration"],
    initialPageSize: 10,
    filterPredicate: (item, filters) => {
      if (filters.status && item.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
      return true;
    },
  });

  const handleAddCycle = () => {
    console.log("Add new cycle");
  };

  const handleViewDetails = (id: string) => {
    console.log("View details for:", id);
  };

  const columns = useMemo<ColumnDef<NominationCycleItem>[]>(
    () => [
      {
        accessorKey: "cycleName",
        header: "Cycle Name",
        cell: (info) => (
          <span className="text-sm text-gray-900 font-semibold">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: (info) => (
          <span className="text-sm text-gray-600">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as NominationCycleItem["status"];
          return status === "Active" ? (
            <span className="text-green-600 font-semibold text-sm">Active</span>
          ) : (
            <span className="text-blue-600 font-semibold text-sm">Completed</span>
          );
        },
      },
      {
        accessorKey: "nominations",
        header: "Nominations",
        cell: (info) => (
          <span className="text-sm text-gray-900 font-medium">
            {Number(info.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "winners",
        header: "Winners",
        cell: (info) => (
          <span className="text-sm text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleViewDetails(row.original.id)}
              className="text-blue-600 hover:text-blue-700 cursor-pointer p-1 rounded hover:bg-blue-50"
              title="View details"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <div>
        {/* Back Button */}
        <BackToSetting />

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                Nomination Cycle Master
              </h1>
              <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {totalRecords} Cycles
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search cycles..."
                className="w-56"
              />
              <TableToolbarActions
                onOpenFilter={openFilter}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={resetFilters}
                onExport={() => exportToCsv(paginatedData as unknown as Record<string, unknown>[], "nomination-cycles.csv")}
                exportTitle="Export Cycles"
                onAdd={handleAddCycle}
                addTitle="Add New Cycle"
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
            headerClassName="border-b border-gray-200 bg-white"
            headCellClassName="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
            cellClassName="px-4 py-4"
            rowClassName="hover:bg-gray-50 transition-colors"
          />

          {/* Pagination */}
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
        </div>
      </div>

      {/* Shared CustomPanel for Filters */}
      <CustomPanel
        isOpen={isFilterOpen}
        onClose={closeFilter}
        title="Filter Nomination Cycles"
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
          <Field label="Cycle Status">
            <SelectField
              placeholder="All Statuses"
              value={tempFilters.status ?? ""}
              onChange={(val) => setFilterField("status", val)}
              options={["Active", "Completed"]}
            />
          </Field>
        </div>
      </CustomPanel>
    </div>
  );
};

export default NominationCycleMaster;