import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, X, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Recipient } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import AddRecipientForm from "@/components/SendMoney/AddRecipientForm";
import Logo from "@/components/Logo";
import FdicLogo from "@/components/assets/FdicLogo";

// Import avatars
import Avatar1 from "@assets/Avatar.png";
import Avatar2 from "@assets/Avatar-2.png";
import Avatar3 from "@assets/Avatar-3.png";
import Avatar4 from "@assets/Avatar-4.png";
import Avatar5 from "@assets/Avatar-5.png";
import Avatar6 from "@assets/Avatar-6.png";
import Avatar7 from "@assets/Avatar-7.png";
import Avatar8 from "@assets/Avatar-8.png";
import Avatar9 from "@assets/Avatar-9.png";
import Avatar10 from "@assets/Avatar-10.png";

// Helper function to get avatar image (same logic as RecipientStep)
const getAvatarImage = (id: string, name?: string) => {
  const idNum = parseInt(id);
  
  if (idNum > 10) return null;
  if (idNum % 10 >= 3) return null;
  
  if (!name) {
    switch (idNum % 10) {
      case 0: return Avatar1;
      case 1: return Avatar5;
      case 2: return Avatar9;
      default: return null;
    }
  }
  
  const femaleNames = [
    "Emma", "Sophia", "Olivia", "Isabella", "Charlotte", 
    "Amelia", "Harper", "Evelyn", "Abigail", "Emily",
    "Elizabeth", "Mia", "Ella", "Scarlett", "Grace",
    "Chloe", "Victoria", "Riley", "Aria", "Lily",
    "Aubrey", "Zoey", "Penelope", "Lillian", "Addison",
    "Layla", "Natalie", "Camila", "Hannah", "Brooklyn",
    "Zoe", "Nora", "Leah", "Savannah", "Audrey",
    "Claire", "Eleanor", "Skylar", "Ellie", "Samantha"
  ];
  
  const firstName = name.split(' ')[0];
  const isFemale = femaleNames.some(femaleName => 
    firstName.toLowerCase() === femaleName.toLowerCase()
  );
  
  if (idNum % 10 < 3) {
    if (isFemale) {
      const femaleAvatarIndex = idNum % 4;
      switch (femaleAvatarIndex) {
        case 0: return Avatar1;
        case 1: return Avatar2;
        case 2: return Avatar7;
        case 3: return Avatar8;
        default: return Avatar1;
      }
    } else {
      const maleAvatarIndex = idNum % 6;
      switch (maleAvatarIndex) {
        case 0: return Avatar3;
        case 1: return Avatar4;
        case 2: return Avatar5;
        case 3: return Avatar6;
        case 4: return Avatar9;
        case 5: return Avatar10;
        default: return Avatar3;
      }
    }
  }
  
  return null;
};

// Helper function to format account details
const formatAccountDetails = (recipient: Recipient) => {
  // For email addresses (PayPal typically)
  if (recipient.username.includes("@") && !recipient.username.startsWith("@")) {
    return recipient.username;
  }
  
  // For Venmo usernames starting with @
  if (recipient.username.startsWith("@")) {
    return recipient.username;
  }
  
  // For bank accounts or business accounts, create descriptive names
  if (recipient.service === "rebolt" || !recipient.service) {
    const bankNames = ["Monzo Bank", "HSBC Savings", "Mercury Business", "Chase Bank", "Wells Fargo", "Bank of America"];
    const randomBank = bankNames[parseInt(recipient.id) % bankNames.length];
    return `${randomBank} *${recipient.id.slice(-4)}`;
  }
  
  return recipient.username;
};

export default function ManageRecipients() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [addRecipientOpen, setAddRecipientOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipientToDelete, setRecipientToDelete] = useState<Recipient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recipients
  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ["/api/users/1/recipients"],
    queryFn: async (): Promise<Recipient[]> => {
      const response = await fetch("/api/users/1/recipients");
      if (!response.ok) throw new Error("Failed to fetch recipients");
      return response.json();
    }
  });

  // Delete recipient mutation
  const deleteRecipientMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await apiRequest("DELETE", `/api/recipients/${recipientId}`);
      if (!response.ok) throw new Error("Failed to delete recipient");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/recipients"] });
      toast({
        title: "Recipient deleted",
        description: "The recipient has been removed from your list.",
      });
      setDeleteDialogOpen(false);
      setRecipientToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recipient. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (recipient: Recipient) => {
    // TODO: Implement edit functionality
    toast({
      title: "Edit recipient",
      description: "Edit functionality coming soon!",
    });
  };

  const handleRecipientAdded = (newRecipient: Recipient) => {
    queryClient.invalidateQueries({ queryKey: ["/api/users/1/recipients"] });
    setAddRecipientOpen(false);
    toast({
      title: "Recipient added",
      description: `${newRecipient.name} has been added to your recipients.`,
    });
  };

  const handleDeleteRecipient = (recipient: Recipient) => {
    setRecipientToDelete(recipient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (recipientToDelete) {
      deleteRecipientMutation.mutate(recipientToDelete.id);
    }
  };

  // Filter and paginate recipients
  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecipients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecipients = filteredRecipients.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header - matches SendMoney flow width */}
        <div className="py-3 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap">
            {/* Left: Logo */}
            <div className="flex-none mr-4">
              <Logo className="h-8" />
            </div>

            {/* Right: Send Money button, Menu and Close */}
            <div className="flex items-center space-x-4 flex-none">
              <Button
                onClick={() => setLocation("/send-money")}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg flex items-center space-x-2 px-4 py-2"
              >
                <span>Send Money</span>
              </Button>
              <button
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => setLocation("/")}
                className="p-0.5"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Recipients</h1>
            <Button
              variant="secondary"
              onClick={() => setAddRecipientOpen(true)}
              className="flex items-center space-x-1.5 text-sm px-3 py-1.5"
            >
              <Plus className="h-3 w-3" />
              <span>Add recipient</span>
            </Button>
          </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 border-gray-300 rounded-lg text-sm py-2"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-500">Loading recipients...</div>
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No recipients found" : "No recipients yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Add your first recipient to start sending money"
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setAddRecipientOpen(true)}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Recipient
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 py-2 px-3 text-xs font-medium text-gray-600 border-b border-gray-200">
              <div className="col-span-6">Name</div>
              <div className="col-span-4">Details</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {paginatedRecipients.map((recipient) => {
                const avatarImage = getAvatarImage(recipient.id, recipient.name);
                const initials = recipient.name
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div key={recipient.id} className="grid grid-cols-12 gap-3 py-3 px-3 hover:bg-gray-50">
                    <div className="col-span-6 flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        {avatarImage ? (
                          <AvatarImage src={avatarImage} alt={recipient.name} />
                        ) : (
                          <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
                            {initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium text-gray-900 text-sm">{recipient.name}</span>
                    </div>
                    <div className="col-span-4 flex items-center">
                      <span className="text-gray-600 text-sm">{formatAccountDetails(recipient)}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(recipient)}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecipient(recipient)}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 mt-6 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 text-xs px-2 py-1"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span>Previous</span>
                </Button>
                <span className="text-xs text-gray-600">
                  Page {currentPage} to {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 text-xs px-2 py-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Add Recipient Dialog */}
      <AddRecipientForm
        open={addRecipientOpen}
        onOpenChange={setAddRecipientOpen}
        onSuccess={handleRecipientAdded}
      />


      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipient</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{recipientToDelete?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteRecipientMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteRecipientMutation.isPending}
              >
                {deleteRecipientMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}