"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MinistryTeams } from "./ministry-teams"
import { VolunteerTeams } from "./volunteer-teams"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Member {
  id: string
  full_name: string
}

interface MinistryTeam {
  id: string
  name: string
  description: string | null
  leader: { id: string; full_name: string } | null
  ministry_team_members: Array<{
    id: string
    user: { id: string; full_name: string }
    role: string | null
  }>
}

interface VolunteerTeam {
  id: string
  name: string
  description: string | null
  coordinator: { id: string; full_name: string } | null
  volunteer_team_members: Array<{
    id: string
    user: { id: string; full_name: string }
  }>
}

interface TeamsViewProps {
  ministryTeams: MinistryTeam[]
  volunteerTeams: VolunteerTeam[]
  members: Member[]
  churchTenantId: string
}

export function TeamsView({
  ministryTeams: initialMinistryTeams,
  volunteerTeams: initialVolunteerTeams,
  members,
  churchTenantId,
}: TeamsViewProps) {
  const [ministryTeams, setMinistryTeams] = useState(initialMinistryTeams)
  const [volunteerTeams, setVolunteerTeams] = useState(initialVolunteerTeams)
  const supabase = getSupabaseBrowserClient()

  const handleAddMinistryTeam = async (teamData: any) => {
    const { data, error } = await supabase
      .from("ministry_teams")
      .insert({
        ...teamData,
        church_tenant_id: churchTenantId,
      })
      .select("*, leader:users(id, full_name), ministry_team_members(id, user:users(id, full_name), role)")
      .single()

    if (!error && data) {
      setMinistryTeams([data, ...ministryTeams])
    }
  }

  const handleUpdateMinistryTeam = async (id: string, updates: any) => {
    const { error } = await supabase.from("ministry_teams").update(updates).eq("id", id)

    if (!error) {
      setMinistryTeams(ministryTeams.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    }
  }

  const handleDeleteMinistryTeam = async (id: string) => {
    const { error } = await supabase.from("ministry_teams").delete().eq("id", id)

    if (!error) {
      setMinistryTeams(ministryTeams.filter((t) => t.id !== id))
    }
  }

  const handleAddVolunteerTeam = async (teamData: any) => {
    const { data, error } = await supabase
      .from("volunteer_teams")
      .insert({
        ...teamData,
        church_tenant_id: churchTenantId,
      })
      .select("*, coordinator:users(id, full_name), volunteer_team_members(id, user:users(id, full_name))")
      .single()

    if (!error && data) {
      setVolunteerTeams([data, ...volunteerTeams])
    }
  }

  const handleUpdateVolunteerTeam = async (id: string, updates: any) => {
    const { error } = await supabase.from("volunteer_teams").update(updates).eq("id", id)

    if (!error) {
      setVolunteerTeams(volunteerTeams.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    }
  }

  const handleDeleteVolunteerTeam = async (id: string) => {
    const { error } = await supabase.from("volunteer_teams").delete().eq("id", id)

    if (!error) {
      setVolunteerTeams(volunteerTeams.filter((t) => t.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
        <p className="text-muted-foreground">Manage ministry and volunteer teams</p>
      </div>

      <Tabs defaultValue="ministry" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ministry">Ministry Teams</TabsTrigger>
          <TabsTrigger value="volunteer">Volunteer Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="ministry" className="space-y-4">
          <MinistryTeams
            teams={ministryTeams}
            members={members}
            onAdd={handleAddMinistryTeam}
            onUpdate={handleUpdateMinistryTeam}
            onDelete={handleDeleteMinistryTeam}
          />
        </TabsContent>

        <TabsContent value="volunteer" className="space-y-4">
          <VolunteerTeams
            teams={volunteerTeams}
            members={members}
            onAdd={handleAddVolunteerTeam}
            onUpdate={handleUpdateVolunteerTeam}
            onDelete={handleDeleteVolunteerTeam}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
