"use client";
import { createContext, useContext, useState, ReactNode, JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDialogContextType {
  openDeleteDialog: (options: OpenDeleteDialogOptions) => void;
  closeDeleteDialog: () => void;
}

interface OpenDeleteDialogOptions {
  onDelete: () => void;
  title?: string;
  description?: string;
}

const DeleteDialogContext = createContext<DeleteDialogContextType>({
  openDeleteDialog: () => {},
  closeDeleteDialog: () => {},
});

export const useDeleteDialog = (): DeleteDialogContextType =>
  useContext(DeleteDialogContext);

interface DeleteDialogProviderProps {
  children: ReactNode;
}

export const DeleteDialogProvider = ({
  children,
}: DeleteDialogProviderProps): JSX.Element => {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [deleteCallback, setDeleteCallback] = useState<(() => void) | null>(
    null,
  );
  const [dialogTitle, setDialogTitle] = useState<string>(
    "Are you sure you want to delete this item?",
  );
  const [dialogDescription, setDialogDescription] = useState<string>(
    "This action cannot be undone. This will permanently delete the item and all related data.",
  );

  const openDeleteDialog = ({
    onDelete,
    title = "Are you sure you want to delete this item?",
    description = "This action cannot be undone. This will permanently delete the item and all related data.",
  }: OpenDeleteDialogOptions): void => {
    setDeleteCallback(() => onDelete);
    setDialogTitle(title);
    setDialogDescription(description);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = (): void => {
    setShowDeleteDialog(false);
    setDeleteCallback(null);
  };

  const handleDelete = (): void => {
    if (deleteCallback) {
      deleteCallback();
    }
    closeDeleteDialog();
  };

  const value = {
    openDeleteDialog,
    closeDeleteDialog,
  };

  return (
    <DeleteDialogContext.Provider value={value}>
      {children}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(false)}
      >
        <DialogContent>
          <DialogTitle>{dialogTitle}</DialogTitle>

          <DialogDescription>{dialogDescription}</DialogDescription>
          <div className="flex justify-between">
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DeleteDialogContext.Provider>
  );
};
