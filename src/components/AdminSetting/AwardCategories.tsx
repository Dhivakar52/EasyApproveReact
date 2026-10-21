import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import BackToSetting from "../BackToSetting";
import { DataTable } from "@/common/Datatable";
import { TableSearch } from "@/common/TableSearch";
import { Pagination } from "@/common/Pagination";
import { ActionMenu } from "@/common/ActionMenu";
import { DeleteConfirmationDialog } from "@/common/DeleteConfirmationDialog";
import CustomPanel from "@/common/CustomPanel";
import TableToolbarActions from "@/common/TableToolbarActions";
import { exportToCsv } from "@/lib/utils";
import { Field, TextField } from "@/components/FormPrimitives";
import { useTable } from "@/hooks/useTable";
import { MOCK_AWARD_CATEGORIES, type AwardCategoryItem } from "@/mocks/awards.mock";

const AwardCategories = () => {
  const [categories, setCategories] = useState<AwardCategoryItem[]>(MOCK_AWARD_CATEGORIES);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const {
    search,
    setSearch,
    paginatedData,
    totalRecords,
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    isFilterOpen,
    openFilter,
    closeFilter,
    tempFilters,
    appliedFilters,
    setFilterField,
    applyFilters,
    resetFilters,
    hasActiveFilters,
    clearSingleFilter,
  } = useTable<AwardCategoryItem>({
    data: categories,
    searchFields: ["name", "description"],
    initialPageSize: 10,
    filterPredicate: (item, filters) => {
      if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      return true;
    },
  });

  const handleEdit = (id: string) => {
    console.log("Edit category:", id);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      setCategories((prev) => prev.filter((cat) => cat.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  const handleAddNew = () => {
    console.log("Add new category");
  };

  const columns = useMemo<ColumnDef<AwardCategoryItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Category Name",
        cell: (info) => (
          <span className="text-sm font-semibold text-gray-900">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => (
          <span className="text-sm text-gray-600">{String(info.getValue())}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex items-center justify-center w-full">
              <ActionMenu
                item={category}
                actions={[
                  {
                    label: "Edit Category",
                    icon: <Edit2 className="w-4 h-4 text-blue-600 mr-2" />,
                    onClick: () => handleEdit(category.id),
                  },
                  {
                    label: "Delete Category",
                    icon: <Trash2 className="w-4 h-4 text-red-600 mr-2" />,
                    variant: "danger" as const,
                    onClick: () => setDeleteTargetId(category.id),
                  },
                ]}
              />
            </div>
          );
        },
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
                Award Categories
              </h1>
              <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {totalRecords} Records
              </span>
            </div>
            <div className="flex items-center gap-3">
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search by category..."
                className="w-64"
              />
              <TableToolbarActions
                onOpenFilter={openFilter}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={resetFilters}
                onExport={() => exportToCsv(paginatedData as unknown as Record<string, unknown>[], "award-categories.csv")}
                exportTitle="Export Categories"
                onAdd={handleAddNew}
                addTitle="Add New Category"
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
                      ×
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

      {/* Filter Panel (CustomPanel) */}
      <CustomPanel
        isOpen={isFilterOpen}
        title="Filter Categories"
        onClose={closeFilter}
        onSave={applyFilters}
        saveLabel="Apply Filters"
        cancelLabel="Reset"
      >
        <div className="space-y-4">
          <Field label="Category Name">
            <TextField
              value={tempFilters.name || ""}
              onChange={(val) => setFilterField("name", val)}
              placeholder="Filter by category name..."
            />
          </Field>
        </div>
      </CustomPanel>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
};

export default AwardCategories;