"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Settings } from "lucide-react"
import { ManageTeamCategoriesDialog } from "./manage-team-categories-dialog"

interface TeamCategory {
  id: string
  name: string
}

interface TeamMember {
  id: string
  full_name: string
  email: string
}

interface TeamAssignment {
  id: string
  category_id: string
  user_id: string
  category_name: string
  user_name: string
}

interface TeamAssignmentsSectionProps {
  rundownId: string
  churchTenantId: string
}

export function TeamAssignmentsSection({ rundownId, churchTenantId }: TeamAssignmentsSectionProps) {
  const [categories, setCategories] = useState<TeamCategory[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [assignments, setAssignments] = useState<TeamAssignment[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedMember, setSelectedMember] = useState("")
  const [showManageDialog, setShowManageDialog] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchCategories()
    fetchMembers()
    fetchAssignments()
  }, [rundownId])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("service_team_categories")
      .select("id, name")
      .eq("church_tenant_id", churchTenantId)
      .eq("is_active", true)
      .order("order_index")

    setCategories(data || [])
  }

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("church_tenant_id", churchTenantId)
      .order("full_name")

    setMembers(data || [])
  }

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("rundown_team_assignments")
      .select(`
        id,
        category_id,
        user_id,
        service_team_categories(name),
        users(full_name)
      `)
      .eq("rundown_id", rundownId)

    if (data) {
      const formatted = data.map((a: any) => ({
        id: a.id,
        category_id: a.category_id,
        user_id: a.user_id,
        category_name: a.service_team_categories?.name || "",
        user_name: a.users?.full_name || "",
      }))
      setAssignments(formatted)
    }
  }

  const handleAddAssignment = async () => {
    if (!selectedCategory || !selectedMember) return

    try {
      const { error } = await supabase.from("rundown_team_assignments").insert({
        rundown_id: rundownId,
        category_id: selectedCategory,
        user_id: selectedMember,
      })

      if (error) throw error

      await fetchAssignments()
      setSelectedCategory("")
      setSelectedMember("")

      toast({
        title: "Team member added",
        description: "Team assignment has been added successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase.from("rundown_team_assignments").delete().eq("id", assignmentId)

      if (error) throw error

      await fetchAssignments()

      toast({
        title: "Team member removed",
        description: "Team assignment has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const groupedAssignments = categories.map((category) => ({
    category,
    members: assignments.filter((a) => a.category_id === category.id),
  }))

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Team Assignments</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowManageDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display Assignments by Category */}
          {groupedAssignments.map(({ category, members }) => (
            <div key={category.id} className="space-y-2">
              <Label className="text-base font-semibold">{category.name}</Label>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No team members assigned</p>
              ) : (
                <div className="space-y-1">
                  {members.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm">{assignment.user_name}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveAssignment(assignment.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Add New Assignment */}
          <div className="pt-4 border-t space-y-3">
            <Label>Add Team Member</Label>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select team..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select person..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddAssignment} disabled={!selectedCategory || !selectedMember}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ManageTeamCategoriesDialog
        open={showManageDialog}
        onOpenChange={setShowManageDialog}
        churchTenantId={churchTenantId}
      />
    </>
  )
}
