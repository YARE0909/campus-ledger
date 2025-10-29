import React from "react";
import { FormModal } from "@/components/Modal";
import { UpdateInstitutionRequest } from "@/lib/api/types";
import InstitutionForm from "./InstitutionForm";

interface UpdateInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: UpdateInstitutionRequest | null;
  setFormData: React.Dispatch<React.SetStateAction<UpdateInstitutionRequest | null>>;
  subscriptionTiers: { id: string; name: string }[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function UpdateInstitutionModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  subscriptionTiers,
  isSubmitting,
  onSubmit,
}: UpdateInstitutionModalProps) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Institution"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Update Institution"
    >
      <InstitutionForm
        formData={formData}
        setFormData={setFormData}
        subscriptionTiers={subscriptionTiers}
      />
    </FormModal>
  );
}
