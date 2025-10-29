import React from "react";
import { FormModal } from "@/components/Modal";

interface DeleteInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  institutionName: string;
  isSubmitting: boolean;
}

export function DeleteInstitutionModal({
  isOpen,
  onClose,
  onConfirm,
  institutionName,
  isSubmitting,
}: DeleteInstitutionModalProps) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Institution"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
      isSubmitting={isSubmitting}
      submitLabel="Confirm Delete"
      cancelLabel="Cancel"
    >
      <p>
        Are you sure you want to delete <strong>{institutionName}</strong>? This action cannot be undone.
      </p>
    </FormModal>
  );
}
