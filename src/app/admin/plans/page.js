"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { PlanForm } from "@/components/admin/PlanForm"
import { buttonVariants } from "@/components/ui/button"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {Toaster} from "@/components/ui/sonner"

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow key={index}>
            
          <TableCell><Skeleton className="h-4 w-[100px] bg-gray-200" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px] bg-gray-200" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px] bg-gray-200" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px] bg-gray-200" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px] bg-gray-200" /></TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Skeleton className="h-6 w-[60px] rounded-full bg-gray-200" />
              <Skeleton className="h-6 w-[60px] rounded-full bg-gray-200" />
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-md bg-gray-200" />
              <Skeleton className="h-8 w-8 rounded-md bg-gray-200" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetchPlans = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://127.0.0.1:8000/api/admin/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setPlans(data.data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleCreatePlan = async (formData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
        //   admin_id: 1 
        })
      })

      if (response.ok) {
        setIsFormOpen(false)
        // Toaster.success('Plan created successfully')
        toast(`Plan ${formData.name} created successfully`, {
          icon: '🎉'
        })
        fetchPlans()
      }
    } catch (error) {
      console.error('Error creating plan:', error)
      toast('Error creating plan', {
        icon: '🚨'
      })
    }
  }

  const handleUpdatePlan = async (formData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/plan/${selectedPlan.id}`, {
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
        toast(`Plan ${formData.name} updated successfully`, {
          icon: '✨'
        })
        fetchPlans()
      }
    } catch (error) {
      console.error('Error updating plan:', error)
      toast('Error updating plan', {
        icon: '🚨'
      })
    }
  }

  const handleDeletePlan = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/plan/${planToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setPlanToDelete(null)
        toast(`Plan ${planToDelete.name} deleted successfully`, {
          icon: '🗑️'
        })
        fetchPlans()
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast('Error deleting plan', {
        icon: '🚨'
      })
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
              <TableHead>Trial Duration</TableHead>
              <TableHead>AI Suggestions</TableHead>
              <TableHead>Features</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{'$'+plan.monthly_price}</TableCell>
                  <TableCell>{'$'+plan.yearly_price}</TableCell>
                  <TableCell>{plan.delivery_limit}</TableCell>
                  <TableCell>{plan.drivers_limit}</TableCell>
                  <TableCell>{plan.trial_duration} days</TableCell>
                  <TableCell>{plan.ai_suggestions ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Features" />
                    </SelectTrigger>
                    <SelectContent>
                        {plan.features.map((feature) => (
                            <SelectItem key={feature} value={feature}>{feature}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* view */}
                      <Button asChild   variant="outline" size="icon"
                        onClick={() => {
                          setSelectedPlan(plan)
                        }}
                        disabled={isLoading}
                      >
                        <Link className={buttonVariants({ variant: "outline",size:"icon" })} href={`/admin/plans/${plan.id}`}>             
                            <Eye className="h-4 w-4" />
                        </Link>
                        </Button>
                      {/* update */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setIsFormOpen(true)
                        }}
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {/* delete */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setPlanToDelete(plan)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
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