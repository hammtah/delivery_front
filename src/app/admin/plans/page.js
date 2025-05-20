"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PlanForm } from "@/components/admin/PlanForm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/plan', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setPlans(data.data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleCreatePlan = async (formData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          admin_id: 1 // This should come from your auth context
        })
      })

      if (response.ok) {
        setIsFormOpen(false)
        fetchPlans()
      }
    } catch (error) {
      console.error('Error creating plan:', error)
    }
  }

  const handleUpdatePlan = async (formData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/plan/${selectedPlan.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsFormOpen(false)
        setSelectedPlan(null)
        fetchPlans()
      }
    } catch (error) {
      console.error('Error updating plan:', error)
    }
  }

  const handleDeletePlan = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/plan/${planToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setPlanToDelete(null)
        fetchPlans()
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Plan Management</h1>
        <Button onClick={() => {
          setSelectedPlan(null)
          setIsFormOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Monthly Price</TableHead>
              <TableHead>Yearly Price</TableHead>
              <TableHead>Delivery Limit</TableHead>
              <TableHead>Drivers Limit</TableHead>
              <TableHead>Features</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell>${plan.monthly_price}</TableCell>
                <TableCell>${plan.yearly_price}</TableCell>
                <TableCell>{plan.delivery_limit}</TableCell>
                <TableCell>{plan.drivers_limit}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedPlan(plan)
                        setIsFormOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setPlanToDelete(plan)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
            </DialogTitle>
          </DialogHeader>
          <PlanForm
            plan={selectedPlan}
            onSubmit={selectedPlan ? handleUpdatePlan : handleCreatePlan}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedPlan(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the plan
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 