"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileMinus, ShoppingCart, Calendar, Wallet, Receipt, Users, FileX } from "lucide-react"
import { useNavigate, useLocation, useParams } from "react-router-dom"

// Import our purchases components
import VendorsList from "@/components/purchases/VendorsList"
import ExpensesList from "@/components/purchases/ExpensesList"
import BillsList from "@/components/purchases/BillsList"
import RecurringExpensesList from "@/components/purchases/RecurringExpensesList"
import PurchaseOrdersList from "@/components/purchases/PurchaseOrdersList"
import PaymentsList from "@/components/purchases/PaymentsList"
import RecurringBillsList from "@/components/purchases/RecurringBillsList"
import VendorCreditsList from "@/components/purchases/VendorCreditsList"
import PurchaseReturnsList from "@/components/purchases/PurchaseReturnsList"
import CreditNotesList from "@/components/purchases/CreditNotesList"
import DebitNotesList from "@/components/purchases/DebitNotesList"

// Tab interface for structured tab data
interface PurchasesTab {
  id: string
  label: string
  icon: React.ReactNode
}

const Purchases = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { organizationId } = useParams()

  // Get current active tab based on location
  const getCurrentTab = () => {
    const currentPath = location.pathname
    const pathParts = currentPath.split('/')
    const lastPart = pathParts[pathParts.length - 1]

    // Map the URL path to tab ID
    const pathToTabMap: { [key: string]: string } = {
      'vendors': 'vendors',
      'purchase-orders': 'purchase-orders',
      'bills': 'bills',
      'payments-made': 'payments-made',
      'recurring-bills': 'recurring-bills',
      'vendor-credits': 'vendor-credits',
      'debit-notes': 'debit-notes'
    }

    return pathToTabMap[lastPart] || 'vendors' // Default to vendors if no match
  }

  // State for active tab
  const [activeTab, setActiveTab] = useState(getCurrentTab())

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getCurrentTab())
  }, [location])

  // Handle tab change with navigation
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue)
    navigate(`/${organizationId}/purchases/${tabValue}`)
  }

  // Define all purchases tabs with icons
  const purchasesTabs: PurchasesTab[] = [
    { id: "vendors", label: "Vendors", icon: <Users className="h-4 w-4" /> },
    { id: "purchase-orders", label: "Purchase Orders", icon: <ShoppingCart className="h-4 w-4" /> },
    { id: "bills", label: "Bills", icon: <Receipt className="h-4 w-4" /> },
    { id: "payments-made", label: "Payments Made", icon: <Wallet className="h-4 w-4" /> },
    { id: "recurring-bills", label: "Recurring Bills", icon: <Calendar className="h-4 w-4" /> },
    { id: "vendor-credits", label: "Vendor Credits", icon: <FileMinus className="h-4 w-4" /> },
    { id: "debit-notes", label: "Debit Notes", icon: <FileX className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Purchase Management</h1>
        <p className="text-muted-foreground mt-1">Manage vendors, expenses, purchase orders, and bills</p>
      </div>

      <Separator className="my-6" />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="bg-muted rounded-lg p-1 overflow-x-auto">
          <TabsList className="inline-flex min-w-full h-auto bg-transparent p-0 gap-1">
            {purchasesTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="vendors" className="m-0">
            <VendorsList />
          </TabsContent>

          <TabsContent value="purchase-orders" className="m-0">
            <PurchaseOrdersList />
          </TabsContent>

          <TabsContent value="bills" className="m-0">
            <BillsList />
          </TabsContent>

          <TabsContent value="payments-made" className="m-0">
            <PaymentsList />
          </TabsContent>

          <TabsContent value="recurring-bills" className="m-0">
            <RecurringBillsList />
          </TabsContent>

          <TabsContent value="vendor-credits" className="m-0">
            <VendorCreditsList />
          </TabsContent>

          <TabsContent value="debit-notes" className="m-0">
            <DebitNotesList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Purchases
