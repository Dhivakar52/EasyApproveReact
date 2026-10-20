import React, { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import BackToSetting from "../BackToSetting";
import { DataTable } from "@/common/Datatable";
import { TableSearch } from "@/common/TableSearch";
import { Pagination } from "@/common/Pagination";
import { TableToolbarActions } from "@/common/TableToolbarActions";
import { DeleteConfirmationDialog } from "@/common/DeleteConfirmationDialog";
import { exportToCsv } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { MOCK_ENTITIES_DEPARTMENTS, type EntityDepartmentItem } from "@/mocks/adminMaster.mock";

const STORAGE_KEY = "easyapprove_entities_departments";

export default function EntitiesDepartments() {
  const [items, setItems] = useState<EntityDepartmentItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return MOCK_ENTITIES_DEPARTMENTS;
  });

  const saveItems = (updated: EntityDepartmentItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [draftEntity, setDraftEntity] = useState("");
  const [draftDepartment, setDraftDepartment] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EntityDepartmentItem | null>(null);
  const [formEntity, setFormEntity] = useState("");
  const [formDepartments, setFormDepartments] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filter logic
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (entityFilter && !item.entity.toLowerCase().includes(entityFilter.toLowerCase())) {
        return false;
      }
      if (departmentFilter && !item.departments.toLowerCase().includes(departmentFilter.toLowerCase())) {
        return false;
      }
      if (!q) return true;
      return (
        item.entity.toLowerCase().includes(q) ||
        item.departments.toLowerCase().includes(q)
      );
    });
  }, [items, search, entityFilter, departmentFilter]);

  // Reset pagination on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, entityFilter, departmentFilter]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const hasActiveFilters = Boolean(entityFilter || departmentFilter);
  const activeFilterCount = (entityFilter ? 1 : 0) + (departmentFilter ? 1 : 0);

  const handleOpenFilterPanel = () => {
    setDraftEntity(entityFilter);
    setDraftDepartment(departmentFilter);
    setIsFilterPanelOpen(true);
  };

  const handleApplyFilters = () => {
    setEntityFilter(draftEntity);
    setDepartmentFilter(draftDepartment);
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
    toast.success("Filters applied successfully.");
  };

  const handleResetFilters = () => {
    setDraftEntity("");
    setDraftDepartment("");
    setEntityFilter("");
    setDepartmentFilter("");
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
    toast.info("Filters reset.");
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormEntity("");
    setFormDepartments("");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EntityDepartmentItem) => {
    setEditingItem(item);
    setFormEntity(item.entity);
    setFormDepartments(item.departments);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!formEntity.trim()) errs.entity = "Enter the entity / group name.";
    if (!formDepartments.trim()) errs.departments = "Enter at least one department.";

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    if (editingItem) {
      const updated = items.map((i) =>
        i.id === editingItem.id
          ? { ...i, entity: formEntity.trim(), departments: formDepartments.trim() }
          : i
      );
      saveItems(updated);
      toast.success(`Group "${formEntity}" updated successfully.`);
    } else {
      const newItem: EntityDepartmentItem = {
        id: `ent_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        entity: formEntity.trim(),
        departments: formDepartments.trim(),
      };
      saveItems([newItem, ...items]);
      toast.success(`Group "${formEntity}" created successfully.`);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      const target = items.find((i) => i.id === deleteTargetId);
      const updated = items.filter((i) => i.id !== deleteTargetId);
      saveItems(updated);
      setDeleteTargetId(null);
      toast.warning(`Group "${target?.entity || deleteTargetId}" deleted.`);
    }
  };

  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      ID: item.id,
      "Entity / Group": item.entity,
      Departments: item.departments,
    }));
    exportToCsv(exportData, "groups-entities-departments.csv");
    toast.success("Groups catalog exported to CSV successfully.");
  };

  const filterPanelContent = (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Entity / Group Name
        </label>
        <input
          type="text"
          value={draftEntity}
          onChange={(e) => setDraftEntity(e.target.value)}
          placeholder="e.g. SRM Tech"
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Department Keyword
        </label>
        <input
          type="text"
          value={draftDepartment}
          onChange={(e) => setDraftDepartment(e.target.value)}
          placeholder="e.g. Cloud Infra, Quality, Dev"
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
        />
      </div>
    </div>
  );

  const columns = useMemo<ColumnDef<EntityDepartmentItem>[]>(
    () => [
      {
        accessorKey: "entity",
        header: "Entity / Group",
        cell: ({ row }) => (
          <div className="font-semibold text-slate-900 whitespace-nowrap min-w-[12rem]">
            {row.original.entity}
          </div>
        ),
      },
      {
        accessorKey: "departments",
        header: "Departments",
        cell: ({ row }) => (
          <div className="text-slate-700 text-xs leading-relaxed min-w-[20rem]">
            {row.original.departments}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 min-w-[8rem] whitespace-nowrap">
              <button
                type="button"
                onClick={() => handleOpenEdit(item)}
                className="btn btn-sm btn-outline !text-xs flex items-center gap-1 cursor-pointer"
                title="Edit group"
              >
                <i className="fa-solid fa-pen text-[10px]"></i> Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(item.id)}
                className="btn btn-sm btn-danger-outline !text-xs flex items-center gap-1 cursor-pointer"
                title="Delete group"
              >
                <i className="fa-solid fa-trash-can text-[10px]"></i> Delete
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-3.5 sm:p-5 md:p-6 space-y-5">
      {/* Show back button only if navigated from admin settings subpages */}
      <div className="mb-2">
        <BackToSetting />
      </div>

      {/* Page Header matching HTML prototype standard */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Entities &amp; Groups Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure enterprise operational groups, organizational units, and functional departments.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
        >
          <i className="fa-solid fa-circle-plus mr-1"></i> Add Group / Entity
        </button>
      </div>

      {/* Main Card with Table and Filter Header matching shared design */}
      <section className="card bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Toolbar matching Prototype standard */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by entity or departments..."
              allowClear
            />
          </div>

          <TableToolbarActions
            isFilterOpen={isFilterPanelOpen}
            onOpenFilter={handleOpenFilterPanel}
            onCloseFilter={() => setIsFilterPanelOpen(false)}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleResetFilters}
            filterPanelTitle="Filter Groups & Departments"
            filterPanelContent={filterPanelContent}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            onExport={handleExport}
            exportTitle="Export Groups CSV"
            onPrint={() => window.print()}
            showFilterAction={true}
          />
        </div>

        {/* Reusable Data Table matching dark navy header */}
        <DataTable
          columns={columns}
          data={paginatedData}
          emptyMessage="No entities or departments match your query."
          containerClassName="rounded-none border-0 shadow-none overflow-x-auto"
          tableClassName="w-full border-collapse table-auto text-left min-w-[700px]"
          headerClassName="bg-[#0B132B]"
          headCellClassName="text-xs font-semibold text-white tracking-normal py-3.5 px-4"
          cellClassName="py-3 px-4 text-xs border-b border-slate-100 align-middle"
          rowClassName="hover:bg-slate-50/80 transition"
        />

        {/* Reusable Shared Pagination */}
        {filteredData.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalRecords={filteredData.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
      </section>

      {/* Add / Edit Entity & Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <i className={`fa-solid ${editingItem ? "fa-pen-to-square text-blue-600" : "fa-circle-plus text-[#08805e]"}`}></i>
                {editingItem ? "Edit Group / Entity" : "Add Group / Entity"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer p-1"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entity / Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formEntity}
                  onChange={(e) => {
                    setFormEntity(e.target.value);
                    if (formErrors.entity) setFormErrors((prev) => ({ ...prev, entity: "" }));
                  }}
                  placeholder="e.g. SRM Tech"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
                  required
                />
                {formErrors.entity && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.entity}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Departments <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formDepartments}
                  onChange={(e) => {
                    setFormDepartments(e.target.value);
                    if (formErrors.departments) setFormErrors((prev) => ({ ...prev, departments: "" }));
                  }}
                  rows={3}
                  placeholder="Comma-separated list (e.g. Engineering, Quality, Cloud Infra, Support)"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
                  required
                />
                {formErrors.departments && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.departments}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Separate departmental divisions using commas.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs px-5 py-2 cursor-pointer"
                >
                  {editingItem ? "Save Changes" : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Group / Entity"
        description="Are you sure you want to delete this group and its department definitions? This action cannot be undone."
      />
    </div>
  );
}