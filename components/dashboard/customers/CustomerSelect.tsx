"use client"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, User, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSearchCustomers } from "@/hooks/useCustomerQueries"
import { Skeleton } from "@/components/ui/skeleton"

interface Customer {
  id: string
  name: string
  company: string | null
  consignee: string | null
  email: string | null
  phone: string | null
}

interface CustomerSelectProps {
  value?: string
  onValueChange: (customerId: string, customer: Customer | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CustomerSelect({
  value,
  onValueChange,
  placeholder = "Select customer...",
  disabled = false,
  className,
}: CustomerSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Only search when query has at least 1 character (changed from 2)
  const { data: searchResult, isLoading } = useSearchCustomers(searchQuery)
  const customers = searchResult?.success ? searchResult.data : []

useEffect(() => {
  if (value && customers && customers.length > 0) { // Added customers check
    const customer = customers.find((c) => c.id === value)
    if (customer) {
      setSelectedCustomer(customer)
    }
  } else if (!value) {
    setSelectedCustomer(null)
  }
}, [value, customers])

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    onValueChange(customer.id, customer)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    setSelectedCustomer(null)
    onValueChange("", null)
    setSearchQuery("")
  }

  // Trigger search immediately when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !searchQuery) {
      setSearchQuery(" ") // Trigger initial search with space
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedCustomer ? (
            <div className="flex items-center">
              <div className="flex items-center">
                {selectedCustomer.company ? (
                  <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                ) : (
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                )}
                <span className="truncate">{selectedCustomer.company || selectedCustomer.name}</span>
              </div>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search customers..."
            value={searchQuery.trim()}
            onValueChange={(value) => setSearchQuery(value || " ")} // Ensure we always have a search query
          />
          <CommandList>
            {isLoading ? (
              <div className="p-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {searchQuery.trim().length === 0 ? "Start typing to search customers..." : "No customers found."}
                </CommandEmpty>
                <CommandGroup>
                  {customers?.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={`${customer.name} ${customer.company || ""} ${customer.email || ""}`}
                      onSelect={() => handleSelect(customer)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        {customer.company ? (
                          <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                        ) : (
                          <User className="mr-2 h-4 w-4 text-gray-500" />
                        )}
                        <div>
                          <div className="font-medium">{customer.company || customer.name}</div>
                          {customer.company && <div className="text-sm text-gray-500">Contact: {customer.name}</div>}
                          {customer.email && <div className="text-xs text-gray-400">{customer.email}</div>}
                        </div>
                      </div>
                      <Check className={cn("ml-auto h-4 w-4", value === customer.id ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
        {selectedCustomer && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
