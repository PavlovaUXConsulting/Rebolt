import React, { useState, useMemo, useEffect } from "react";
import { Search, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Recipient } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import AddRecipientForm from "./AddRecipientForm";
import { useIsMobile } from "@/hooks/use-mobile";

// Import service logos
import PaypalLogo from "@assets/PayPal symbol only_1757342514180.png";
import ReboltLogo from "@assets/Rebolt logo.png";
import VenmoLogo from "@assets/Venmo_1757091725271.png";
import ChesapeakeLogo from "@assets/chesapeake-bank-logo.png";

// Import trust section logos
import PaypalLogoNew from "@assets/PayPal_1757085818386.png";
import NachaLogo from "@assets/logo-nacha-sharing 1_1757085818386.png";
import SecurePaymentLogo from "@assets/Sequier Payment_1757085818386.png";

// Import avatar images
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

interface RecipientStepProps {
  onSelectRecipient: (recipient: Recipient) => void;
}

// Helper function to get avatar image based on recipient name gender
const getAvatarImage = (id: string, name?: string) => {
  // Convert id to number for consistent assignment
  const idNum = parseInt(id);
  
  // Always return null for recipients with ID greater than 10 (newly added)
  // This ensures new recipients always show initials instead of photos
  if (idNum > 10) return null;
  
  // Show avatars for only 30% of existing recipients (if idNum % 10 is less than 3)
  // For the other 70%, return null to show initials instead
  if (idNum % 10 >= 3) return null;
  
  // If no name is provided, fall back to ID-based assignment
  if (!name) {
    // Use modulo to cycle through avatars
    switch (idNum % 10) {
      case 0: return Avatar1;
      case 1: return Avatar5;
      case 2: return Avatar9;
      default: return null; // This will show initials
    }
  }
  
  // Define commonly female and male first names
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
  
  // Get the first name from the full name
  const firstName = name.split(' ')[0];
  
  // Check if the name is in the female names list
  const isFemale = femaleNames.some(femaleName => 
    firstName.toLowerCase() === femaleName.toLowerCase()
  );
  
  // If this recipient should have an avatar (30% chance based on id)
  if (idNum % 10 < 3) {
    // Female avatars
    if (isFemale) {
      // Female avatars: 1, 2, 7, 8
      const femaleAvatarIndex = idNum % 4;
      switch (femaleAvatarIndex) {
        case 0: return Avatar1; // Woman with glasses
        case 1: return Avatar2; // Woman with long brown hair
        case 2: return Avatar7; // Woman with shoulder-length brown hair
        case 3: return Avatar8; // Woman with short black hair
        default: return Avatar1;
      }
    } 
    // Male avatars
    else {
      // Male avatars: 3, 4, 5, 6, 9, 10
      const maleAvatarIndex = idNum % 6;
      switch (maleAvatarIndex) {
        case 0: return Avatar3; // Older man with glasses and beard
        case 1: return Avatar4; // Young man with curly hair
        case 2: return Avatar5; // Man with dark hair
        case 3: return Avatar6; // Man with styled hair
        case 4: return Avatar9; // Man with glasses
        case 5: return Avatar10; // Man with short hair
        default: return Avatar3;
      }
    }
  }
  
  // Return null for the 70% that should show initials
  return null;
};

export default function RecipientStep({ onSelectRecipient }: RecipientStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addRecipientOpen, setAddRecipientOpen] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState("Quickly find them by email, phone, or name");
  const recipientsPerPage = 5;
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Update placeholder text based on screen size
  useEffect(() => {
    if (isMobile) {
      setSearchPlaceholder("Search by email, phone or name");
    } else {
      setSearchPlaceholder("Quickly find them by email, phone, or name");
    }
  }, [isMobile]);
  
  // Fetch recipients from the API
  const { data: recipients = [], isLoading, error } = useQuery<Recipient[]>({
    queryKey: ['/api/users/1/recipients'],
    staleTime: 60000, // 1 minute
  });
  
  // Filter recipients based on search query
  const filteredRecipients = useMemo(() => {
    if (recipients.length === 0) return [];
    
    if (!searchQuery) return recipients;
    
    const query = searchQuery.toLowerCase();
    return recipients.filter((recipient) => 
      recipient.name.toLowerCase().includes(query) || 
      recipient.username.toLowerCase().includes(query)
    );
  }, [recipients, searchQuery]);
  
  // Group recipients for different tabs
  // For a real app, these would be fetched from transaction history
  const recentRecipients = useMemo(() => {
    // For demo purposes, take the first 5 recipients
    return filteredRecipients.slice(0, 5);
  }, [filteredRecipients]);
  
  const frequentRecipients = useMemo(() => {
    // For demo purposes, shuffle and take first 5 recipients
    return [...filteredRecipients].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [filteredRecipients]);

  // Render recipient list item
  const renderRecipientItem = (recipient: Recipient) => {
    const avatarImage = getAvatarImage(recipient.id, recipient.name);
    
    return (
      <li key={recipient.id}>
        <button
          onClick={() => onSelectRecipient(recipient)}
          className="w-full flex items-center justify-between py-1.5 hover:bg-gray-50 rounded-md px-2 text-[0.95rem]"
        >
          <div className="flex items-center">
            <Avatar className="h-9 w-9 mr-2.5">
              {(() => {
                return avatarImage ? <AvatarImage src={avatarImage} alt={recipient.name} /> : null;
              })()}
              <AvatarFallback className="bg-[hsl(var(--bank-navy))] text-white font-medium text-[0.85rem]">
                {recipient.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{recipient.name}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            {recipient.service === "paypal" && (
              <img src={PaypalLogo} alt="PayPal" className="h-3 w-3 mr-1.5" />
            )}
            {recipient.service === "venmo" && (
              <img src={VenmoLogo} alt="Venmo" className="h-3 w-3 mr-1.5" />
            )}
            {recipient.service === "rebolt" && (
              <img src={ReboltLogo} alt="Rebolt" className="h-3 w-3 mr-1.5" />
            )}
            <span className="font-mono">{recipient.username}</span>
          </div>
        </button>
      </li>
    );
  };

  // Loading skeletons
  const renderSkeletons = () => (
    Array(5).fill(0).map((_, index) => (
      <li key={index} className="flex items-center justify-between py-2 px-2">
        <div className="flex items-center">
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-5 w-20" />
      </li>
    ))
  );

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < filteredRecipients.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      if (focusedIndex < filteredRecipients.length) {
        onSelectRecipient(filteredRecipients[focusedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchQuery('');
      inputRef.current?.blur();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleAddNewRecipient = () => {
    // Open the add recipient form
    setAddRecipientOpen(true);
  };

  // Handle successful recipient creation
  const handleRecipientAdded = (newRecipient: Recipient) => {
    // Invalidate the recipients query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['/api/users/1/recipients'] });
    
    // Force a refresh of the recipients data
    setTimeout(() => {
      // Select the newly created recipient
      onSelectRecipient(newRecipient);
    }, 300);
  };

  return (
    <>
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send money</h2>
        <label htmlFor="recipient" className="block text-xs font-medium text-gray-700 mb-1.5">
        To
      </label>
      <div className="relative mb-4">
        <div className={`flex flex-col border rounded-md overflow-hidden ${searchQuery ? 'border-[#0082E1]' : 'border-gray-300'}`}>
          {/* Search Input */}
          <div className="flex items-center px-2 py-2">
            <Search className="h-4 w-4 text-gray-500 mr-2" />
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                id="recipient"
                placeholder={searchPlaceholder}
                className="w-full outline-none font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck="false"
                data-form-type="other"
              />
            </div>
            {searchQuery && (
              <button 
                type="button"
                onClick={handleClearSearch}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Search Results - Inside the same frame */}
          {searchQuery && (
            <div className="py-2 px-3 bg-white border-t border-gray-200">
              {filteredRecipients.length > 0 ? (
                filteredRecipients.slice(0, 3).map((recipient, index) => (
                  <div 
                    key={recipient.id}
                    className={`py-1 flex items-center justify-between cursor-pointer ${focusedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    onClick={() => onSelectRecipient(recipient)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-7 w-7 mr-2">
                        {(() => {
                          const avatarSrc = getAvatarImage(recipient.id, recipient.name);
                          return avatarSrc ? <AvatarImage src={avatarSrc} alt={recipient.name} /> : null;
                        })()}
                        <AvatarFallback className="bg-[hsl(var(--bank-navy))] text-white font-medium text-xs">
                          {recipient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{recipient.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center">
                      {recipient.service === "paypal" && (
                        <img src={PaypalLogo} alt="PayPal" className="h-2.5 w-2.5 mr-1" />
                      )}
                      {recipient.service === "venmo" && (
                        <img src={VenmoLogo} alt="Venmo" className="h-2.5 w-2.5 mr-1" />
                      )}
                      {recipient.service === "rebolt" && (
                        <img src={ReboltLogo} alt="Rebolt" className="h-2.5 w-2.5 mr-1" />
                      )}
                      <span className="font-mono">{recipient.username}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-3 flex justify-between items-center">
                  <p className="text-gray-700 text-sm">We couldn't find <span className="font-bold">{searchQuery}</span></p>
                  <button 
                    className="flex items-center gap-1 text-[hsl(var(--bank-navy))] hover:underline ml-2 bg-gray-100 rounded-full p-1.5"
                    onClick={handleAddNewRecipient}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="mr-1 text-sm">Add a recipient</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recent" onValueChange={(value) => {
        // No longer reset search when changing tabs
        // Just reset pagination
        setCurrentPage(1);
        
        // Move the blue underline to the active tab
        const indicator = document.querySelector('[data-active-indicator]') as HTMLElement;
        if (indicator) {
          const tabIndex = value === 'recent' ? 0 : value === 'frequent' ? 1 : 2;
          indicator.style.transform = `translateX(${tabIndex * 100}%)`;
        }
      }}>
        <div className="relative mb-3">
          <TabsList className="inline-flex w-auto bg-transparent p-0 relative">
            <TabsTrigger 
              value="recent" 
              className="py-1.5 px-6 text-gray-500 text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#0078CF] relative"
            >
              Recent
            </TabsTrigger>
            <TabsTrigger 
              value="frequent" 
              className="py-1.5 px-6 text-gray-500 text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#0078CF] relative"
            >
              Frequent
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="py-1.5 px-6 text-gray-500 text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#0078CF] relative"
            >
              All
            </TabsTrigger>
            
            {/* Grey base line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gray-200"></div>
            
            {/* Blue active line that moves */}
            <div className="absolute bottom-0 h-[1.5px] bg-[#0078CF] transition-all duration-200 ease-in-out"
                 style={{
                   left: '0%',
                   width: '33.33%',
                   transform: 'translateX(0%)'
                 }}
                 data-active-indicator></div>
          </TabsList>
        </div>

        {/* Loading state */}
        {isLoading && (
          <ul className="space-y-2">
            {renderSkeletons()}
          </ul>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-4 text-red-500 text-sm">
            Failed to load recipients. Please try again.
          </div>
        )}

        {/* Recent recipients */}
        <TabsContent value="recent" className="mt-0">
          {!isLoading && !error && (
            <ul className="space-y-1.5">
              {recentRecipients.length > 0 ? (
                recentRecipients.map(renderRecipientItem)
              ) : (
                <li className="text-center py-4 text-gray-500 text-sm">No recent recipients found</li>
              )}
            </ul>
          )}
        </TabsContent>

        {/* Frequent recipients */}
        <TabsContent value="frequent" className="mt-0">
          {!isLoading && !error && (
            <ul className="space-y-1.5">
              {frequentRecipients.length > 0 ? (
                frequentRecipients.map(renderRecipientItem)
              ) : (
                <li className="text-center py-4 text-gray-500 text-sm">No frequent recipients found</li>
              )}
            </ul>
          )}
        </TabsContent>

        {/* All recipients with pagination */}
        <TabsContent value="all" className="mt-0">
          {!isLoading && !error && (
            <>
              <ul className="space-y-1.5">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients
                    .slice((currentPage - 1) * recipientsPerPage, currentPage * recipientsPerPage)
                    .map(renderRecipientItem)
                ) : (
                  <li className="text-center py-4 text-gray-500 text-sm">No recipients found</li>
                )}
              </ul>
              
              {/* Pagination */}
              {filteredRecipients.length > recipientsPerPage && (
                <div className="flex justify-center items-center mt-3 space-x-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-40 text-xs"
                  >
                    &lt;
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, Math.ceil(filteredRecipients.length / recipientsPerPage)) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                          currentPage === pageNumber
                            ? 'bg-[hsl(var(--bank-blue))] text-white'
                            : 'border border-gray-300 text-gray-600'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredRecipients.length / recipientsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(filteredRecipients.length / recipientsPerPage)}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-40 text-xs"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </TabsContent>


      </Tabs>
      
      {/* Add Recipient Form */}
      <AddRecipientForm
        open={addRecipientOpen}
        onOpenChange={setAddRecipientOpen}
        searchQuery={searchQuery}
        onSuccess={handleRecipientAdded}
      />
    </div>

    {/* Guaranteed Secure Transfer Section - Full width like header */}
    <div className="mt-8 mb-6">
      <div className="border border-gray-300 rounded-2xl px-6 py-4 relative">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white px-3">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Guaranteed Secure Transfer
          </p>
        </div>
        <div className="flex items-center justify-evenly pt-3">
          <img 
            src={ChesapeakeLogo} 
            alt="Chesapeake Bank" 
            className="h-6 object-contain"
          />
          <img 
            src={SecurePaymentLogo} 
            alt="Secure Payment" 
            className="h-4 object-contain"
          />
          <img 
            src={PaypalLogoNew} 
            alt="PayPal" 
            className="h-4 object-contain"
          />
          <img 
            src={NachaLogo} 
            alt="Nacha" 
            className="h-8 object-contain"
          />
        </div>
      </div>
    </div>
    </>
  );
}