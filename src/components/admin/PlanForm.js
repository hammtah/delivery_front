"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ButtonLoading } from "@/components/ui/button-loading"

export function PlanForm({ plan, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    monthly_price: plan?.monthly_price || "",
    yearly_price: plan?.yearly_price || "",
    delivery_limit: plan?.delivery_limit || "",
    drivers_limit: plan?.drivers_limit || "",
    ai_suggestions: plan?.ai_suggestions || false,
    trial_duration: plan?.trial_duration || 7,
    features: plan?.features || []
  })

  const [newFeature, setNewFeature] = useState("")
  const [isSubmiting, setIsSubmiting] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmiting(true)
    onSubmit(formData)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter plan name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthly_price">Monthly Price</Label>
            <Input
              id="monthly_price"
              type="number"
              value={formData.monthly_price}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_price: e.target.value }))}
              placeholder="Enter monthly price"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearly_price">Yearly Price</Label>
            <Input
              id="yearly_price"
              type="number"
              value={formData.yearly_price}
              onChange={(e) => setFormData(prev => ({ ...prev, yearly_price: e.target.value }))}
              placeholder="Enter yearly price"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="delivery_limit">Delivery Limit</Label>
            <Input
              id="delivery_limit"
              type="number"
              value={formData.delivery_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_limit: e.target.value }))}
              placeholder="Enter delivery limit"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drivers_limit">Drivers Limit</Label>
            <Input
              id="drivers_limit"
              type="number"
              value={formData.drivers_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, drivers_limit: e.target.value }))}
              placeholder="Enter drivers limit"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trial_duration">Trial Duration (days)</Label>
          <Input
            id="trial_duration"
            type="number"
            value={formData.trial_duration}
            onChange={(e) => setFormData(prev => ({ ...prev, trial_duration: e.target.value }))}
            placeholder="Enter trial duration"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ai_suggestions"
            checked={formData.ai_suggestions}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ai_suggestions: checked }))}
          />
          <Label htmlFor="ai_suggestions">AI Suggestions</Label>
        </div>

        <div className="space-y-2">
          <Label>Features</Label>
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature"
            />
            <Button type="button" onClick={addFeature}>
              Add
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{feature}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmiting}>
          {isSubmiting ? <ButtonLoading text="Submitting..." /> : plan ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  )
} 