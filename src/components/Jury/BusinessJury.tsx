import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Flag, Eye, Pencil, Trash2, X } from "lucide-react";
import { DataTable } from "@/common/Datatable";
import { TableSearch } from "@/common/TableSearch";
import { Pagination } from "@/common/Pagination";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import TableToolbarActions from "@/common/TableToolbarActions";
import { exportToCsv } from "@/lib/utils";
import { Field, SelectField } from "@/components/FormPrimitives";
import { useTable } from "@/hooks/useTable";
import { MOCK_JURY_EVALUATION, type JuryNominee } from "@/mocks/jury.mock";
import BusinessPanel from "./BusinessPanel";

const entityOptions = [
  "SRMAP",
  "SRM Tech",
  "SRM Media",
  "Puthiya Thalaimurai",
  "SRM Research",
  "SRM Hospital",
  "SRM Global",
  "PT",
  "SRM University",
  "SRM MHS",
];

const categoryOptions = [
  "Innovation",
  "Service Excellence",
  "Talent",
  "Customer Focus",
  "Leadership Excellence",
  "Best Innovation",
  "Service",
  "Clinical Care",
  "Global Outreach",
  "Cloud Architecture",
  "Data Science",
  "Journalism Excellence",
  "Sports Leadership",
  "Diagnostics Pioneer",
];

const BusinessJury = () => {
  const [juryData] = useState<JuryNominee[]>(MOCK_JURY_EVALUATION);
  const [selectedNominee, setSelectedNominee] = useState<JuryNominee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
  } = useTable<JuryNominee>({
    data: juryData,
    searchFields: ["name", "entity", "category"],
    initialPageSize: 10,
    filterPredicate: (item, filters) => {
      if (filters.entity && item.entity.toLowerCase() !== filters.entity.toLowerCase()) {
        return false;
      }
      if (filters.category && item.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
      if (filters.flag) {
        if (filters.flag === "Flagged" && !item.flag) return false;
        if (filters.flag === "Normal" && item.flag) return false;
      }
      return true;
    },
  });

  const columns = useMemo<ColumnDef<JuryNominee>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nominee",
        cell: (info) => (
          <span className="text-sm font-medium text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "entity",
        header: "Entity",
        cell: (info) => (
          <span className="text-sm text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: (info) => (
          <span className="text-sm text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: (info) => (
          <span className="text-sm font-semibold text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "flag",
        header: "Flag",
        cell: ({ row }) => {
          const nominee = row.original;
          return nominee.flag ? (
            <Flag className="w-4 h-4 text-red-500" />
          ) : (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
              NA
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const nominee = row.original;
          return (
            <ActionMenu
              item={nominee}
              actions={[
                {
                  label: "View",
                  icon: <Eye className="w-4 h-4 mr-2" />,
                  onClick: () => {
                    setSelectedNominee(nominee);
                    setIsDetailOpen(true);
                  },
                },
                {
                  label: "Edit",
                  icon: <Pencil className="w-4 h-4 mr-2 text-blue-600" />,
                  onClick: () => {},
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="w-4 h-4 mr-2 text-red-600" />,
                  onClick: () => {},
                  variant: "danger",
                },
              ]}
            />
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-6 m-5 bg-white rounded-xl shadow-md relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800">Business Jury Evaluation</h2>
          <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
            {totalRecords} Records
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <TableSearch
            value={search}
            onChange={setSearch}
            placeholder="Search Nominee / Entity / Category..."
            className="w-full sm:w-72"
            inputClassName="py-1.5"
          />
          {/* Standardized Toolbar Actions (Filter / Export / Print) */}
          <TableToolbarActions
            onOpenFilter={openFilter}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={resetFilters}
            onExport={() => exportToCsv(paginatedData as unknown as Record<string, unknown>[], "business-jury-evaluations.csv")}
            exportTitle="Export Evaluations"
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

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        headerClassName="bg-gray-100 rounded-t-lg"
        headCellClassName="px-6 py-3 text-left text-sm font-semibold text-gray-600"
        cellClassName="px-6 py-3"
        rowClassName={(_, idx) =>
          idx % 2 === 0
            ? "bg-white hover:bg-gray-50 transition-colors"
            : "bg-gray-50 hover:bg-gray-100 transition-colors"
        }
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

      {/* Right-Side Detail Panel */}
      <BusinessPanel
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        nominee={selectedNominee}
      />

      {/* Shared CustomPanel for Filters */}
      <CustomPanel
        isOpen={isFilterOpen}
        onClose={closeFilter}
        title="Filter Jury Evaluations"
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
          <Field label="Entity">
            <SelectField
              placeholder="All Entities"
              value={tempFilters.entity ?? ""}
              onChange={(val) => setFilterField("entity", val)}
              options={entityOptions}
            />
          </Field>
          <Field label="Category">
            <SelectField
              placeholder="All Categories"
              value={tempFilters.category ?? ""}
              onChange={(val) => setFilterField("category", val)}
              options={categoryOptions}
            />
          </Field>
          <Field label="Flag Status">
            <SelectField
              placeholder="All"
              value={tempFilters.flag ?? ""}
              onChange={(val) => setFilterField("flag", val)}
              options={["Flagged", "Normal"]}
            />
          </Field>
        </div>
      </CustomPanel>
    </div>
  );
};

export default BusinessJury;
