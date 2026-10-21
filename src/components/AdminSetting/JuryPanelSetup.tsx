import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { X, Eye } from "lucide-react";
import BackToSetting from "../BackToSetting";
import { DataTable } from "@/common/Datatable";
import { TableSearch } from "@/common/TableSearch";
import { Pagination } from "@/common/Pagination";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import TableToolbarActions from "@/common/TableToolbarActions";
import { exportToCsv } from "@/lib/utils";
import { Field, SelectField } from "@/components/FormPrimitives";
import { useTable } from "@/hooks/useTable";
import { MOCK_JURY_MEMBERS, type JuryPanelMember } from "@/mocks/jury.mock";

const entityOptions = [
  "SRM Hospital",
  "SRM University",
  "Global Holdings",
  "SRM Tech",
  "Puthiya Thalaimurai",
  "SRM MHS",
  "SRMAP",
  "SRM Research",
  "SRM Holdings",
  "PT",
];

const JuryPanelSetup = () => {
  const [juryMembers] = useState<JuryPanelMember[]>(MOCK_JURY_MEMBERS);

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
  } = useTable<JuryPanelMember>({
    data: juryMembers,
    searchFields: ["name", "entity", "role"],
    initialPageSize: 10,
    filterPredicate: (item, filters) => {
      if (filters.role && item.role.toLowerCase() !== filters.role.toLowerCase()) {
        return false;
      }
      if (filters.entity && item.entity.toLowerCase() !== filters.entity.toLowerCase()) {
        return false;
      }
      return true;
    },
  });

  const handleAddMember = () => {
    console.log("Add new jury member");
  };

  const handleViewDetails = (id: string) => {
    console.log("View details for:", id);
  };

  const columns = useMemo<ColumnDef<JuryPanelMember>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Jury Members List",
        cell: (info) => (
          <span className="text-sm font-semibold text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "entity",
        header: "Entity",
        cell: (info) => (
          <span className="text-sm text-gray-600">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: (info) => {
          const role = info.getValue() as JuryPanelMember["role"];
          return role === "Business" ? (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
              Business
            </span>
          ) : (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
              General
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center w-full">
            <ActionMenu
              item={row.original}
              actions={[
                {
                  label: "View Details",
                  icon: <Eye className="w-4 h-4 text-blue-600 mr-2" />,
                  onClick: () => handleViewDetails(row.original.id),
                },
              ]}
            />
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
                Jury Panel Setup
              </h1>
              <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {totalRecords} Members
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search jury member..."
                className="w-64"
              />
              <TableToolbarActions
                onOpenFilter={openFilter}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={resetFilters}
                onExport={() => exportToCsv(paginatedData as unknown as Record<string, unknown>[], "jury-members.csv")}
                exportTitle="Export Jury Members"
                onAdd={handleAddMember}
                addTitle="Add New Jury Member"
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
        title="Filter Jury Members"
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
          <Field label="Role">
            <SelectField
              placeholder="All Roles"
              value={tempFilters.role ?? ""}
              onChange={(val) => setFilterField("role", val)}
              options={["Business", "General"]}
            />
          </Field>
          <Field label="Entity">
            <SelectField
              placeholder="All Entities"
              value={tempFilters.entity ?? ""}
              onChange={(val) => setFilterField("entity", val)}
              options={entityOptions}
            />
          </Field>
        </div>
      </CustomPanel>
    </div>
  );
};

export default JuryPanelSetup;