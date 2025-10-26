// app/(admin)/branches/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal, { FormModal } from "@/components/Modal";
import Loader from "@/components/Loader";
import { Trash, Edit, Plus, MoreVertical } from "lucide-react";
import { apiHandler } from "@/lib/api/apiClient";
import { endpoints } from "@/lib/api/endpoints";
import { useUser } from "@/contexts/UserContext";
import { GetBranchByTenantResponse } from "@/lib/api/types";
import toast from "react-hot-toast";

export default function BranchesPage() {
  const [branches, setBranches] = useState<GetBranchByTenantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] =
    useState<GetBranchByTenantResponse | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    phone: "",
    address: "",
    gst: "",
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] =
    useState<GetBranchByTenantResponse | null>(null);

  const { user } = useUser();

  const fetchBranches = async () => {
    setLoading(true);
    try {
      if (!user || !user.Tenant?.id) return;
      const res = await apiHandler(endpoints.getBranchByTenant, {
        tenant_id: user?.Tenant.id,
      });
      const { status, data, error, errorMessage, message } = res;
      if (!error && data) setBranches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBranches();
    }
  }, [user]);

  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({
      name: "",
      contact_email: "",
      phone: "",
      address: "",
      gst: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (branch: GetBranchByTenantResponse) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      contact_email: branch.contact_email || "",
      phone: branch.phone || "",
      address: branch.address || "",
      gst: branch.gst || "",
    });
    setModalOpen(true);
  };

  const openDeleteModal = (branch: GetBranchByTenantResponse) => {
    setBranchToDelete(branch);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;

    try {
      const res = await apiHandler(endpoints.deleteBranch, {
        id: branchToDelete.id,
      });
      const { status, data, error } = res;
      if (!error && status === 200) {
        fetchBranches();
        toast.success("Branch deleted successfully");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
      setBranchToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        const res = await apiHandler(endpoints.updateBranch, {
          id: editingBranch.id,
          name: formData.name,
          contact_email: formData.contact_email,
          phone: formData.phone,
          address: formData.address,
          gst: formData.gst,
        });
        const { status, data, error, errorMessage, message } = res;
        if (!error && data) {
          fetchBranches();
          setModalOpen(false);
          return toast.success("Branch updated successfully");
        }
      } else {
        const res = await apiHandler(endpoints.createBranch, {
          name: formData.name,
          tenant_id: user?.Tenant.id!,
          contact_email: formData.contact_email,
          phone: formData.phone,
          address: formData.address,
          gst: formData.gst,
        });
        const { status, data, error, errorMessage, message } = res;
        if (!error && data) {
          fetchBranches();
          setModalOpen(false);
          return toast.success("Branch created successfully");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<GetBranchByTenantResponse>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "contact_email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { key: "address", label: "Address", sortable: true },
    { key: "gst", label: "GST", sortable: true },
    {
      key: "created_at",
      label: "Created At",
      sortable: true,
      render: (b) => new Date(b.created_at).toLocaleDateString(),
    },
  ];

  const renderActions = (branch: GetBranchByTenantResponse) => (
    <div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedBranchId(
            selectedBranchId === branch.id ? null : branch.id
          );
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
      {selectedBranchId === branch.id && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(branch);
              setSelectedBranchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Edit className="w-4 h-4" />
            Edit Batch
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(branch);
              setSelectedBranchId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition"
          >
            <Trash className="w-4 h-4" />
            Delete Batch
          </button>
        </div>
      )}
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Branch Management
          </h1>
          <p className="text-gray-600 mt-2">Create and manage branches</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
          title="Create Branch"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <DataTable
        data={branches}
        columns={columns}
        searchKeys={["name", "contact_email", "phone", "address", "gst"]}
        renderActions={renderActions}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBranch ? "Edit Branch" : "Add Branch"}
        onSubmit={handleSubmit}
        submitLabel={editingBranch ? "Update" : "Create"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) =>
                setFormData({ ...formData, contact_email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST
            </label>
            <input
              type="text"
              value={formData.gst}
              onChange={(e) =>
                setFormData({ ...formData, gst: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </FormModal>
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete the branch "{branchToDelete?.name}"?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
