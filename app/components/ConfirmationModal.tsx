import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus, Edit, Trash2, Save } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type: 'add' | 'edit' | 'delete' | 'save';
  itemName?: string;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type,
  itemName,
  loading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'add':
        return <Plus className="h-6 w-6 text-green-600" />;
      case 'edit':
        return <Edit className="h-6 w-6 text-blue-600" />;
      case 'delete':
        return <Trash2 className="h-6 w-6 text-red-600" />;
      case 'save':
        return <Save className="h-6 w-6 text-blue-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'add':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'edit':
      case 'save':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'add':
        return loading ? 'Adding...' : 'Add';
      case 'edit':
        return loading ? 'Updating...' : 'Update';
      case 'delete':
        return loading ? 'Deleting...' : 'Delete';
      case 'save':
        return loading ? 'Saving...' : 'Save';
      default:
        return loading ? 'Processing...' : 'Confirm';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 mt-2">
            {description}
            {itemName && (
              <span className="font-semibold text-gray-800"> "{itemName}"</span>
            )}
            ?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${getButtonStyle()}`}
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
