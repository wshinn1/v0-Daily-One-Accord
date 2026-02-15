"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Music, Pencil, Trash2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AddWorshipSongDialog } from "./add-worship-song-dialog"
import { EditWorshipSongDialog } from "./edit-worship-song-dialog"
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

interface WorshipSongsSectionProps {
  rundownId: string
  churchTenantId: string
}

export function WorshipSongsSection({ rundownId, churchTenantId }: WorshipSongsSectionProps) {
  const [songs, setSongs] = useState<any[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSong, setEditingSong] = useState<any>(null)
  const [deletingSong, setDeletingSong] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadSongs()
  }, [rundownId])

  const loadSongs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("rundown_worship_songs")
      .select("*")
      .eq("rundown_id", rundownId)
      .order("order_index")

    if (error) {
      console.error("Error loading worship songs:", error)
    } else {
      setSongs(data || [])
    }
    setLoading(false)
  }

  const handleSongAdded = (newSong: any) => {
    setSongs([...songs, newSong])
    setShowAddDialog(false)
  }

  const handleSongUpdated = (updatedSong: any) => {
    setSongs(songs.map((s) => (s.id === updatedSong.id ? updatedSong : s)))
    setEditingSong(null)
  }

  const handleDeleteSong = async () => {
    if (!deletingSong) return

    try {
      const { error } = await supabase.from("rundown_worship_songs").delete().eq("id", deletingSong.id)

      if (error) throw error

      setSongs(songs.filter((s) => s.id !== deletingSong.id))
      toast({
        title: "Song removed",
        description: "The worship song has been removed from the rundown.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeletingSong(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Worship Songs
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Song
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading songs...</p>
          ) : songs.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No worship songs added yet</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add First Song
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <h4 className="font-semibold">{song.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {song.artist && <span>Artist: {song.artist}</span>}
                      {song.key && <span>Key: {song.key}</span>}
                      {song.tempo && <span>Tempo: {song.tempo}</span>}
                    </div>
                    {song.notes && <p className="text-sm text-muted-foreground mt-2">{song.notes}</p>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => setEditingSong(song)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingSong(song)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddWorshipSongDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        rundownId={rundownId}
        churchTenantId={churchTenantId}
        orderIndex={songs.length}
        onSongAdded={handleSongAdded}
      />

      {editingSong && (
        <EditWorshipSongDialog
          open={!!editingSong}
          onOpenChange={(open) => !open && setEditingSong(null)}
          song={editingSong}
          onSongUpdated={handleSongUpdated}
        />
      )}

      <AlertDialog open={!!deletingSong} onOpenChange={(open) => !open && setDeletingSong(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Song</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deletingSong?.title}" from this rundown?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSong}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
