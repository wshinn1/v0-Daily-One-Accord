"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface EditWorshipSongDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  song: any
  onSongUpdated: (song: any) => void
}

export function EditWorshipSongDialog({ open, onOpenChange, song, onSongUpdated }: EditWorshipSongDialogProps) {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [key, setKey] = useState("")
  const [tempo, setTempo] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (song) {
      setTitle(song.title || "")
      setArtist(song.artist || "")
      setKey(song.key || "")
      setTempo(song.tempo || "")
      setNotes(song.notes || "")
    }
  }, [song])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("rundown_worship_songs")
        .update({
          title: title.trim(),
          artist: artist.trim() || null,
          key: key.trim() || null,
          tempo: tempo.trim() || null,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", song.id)
        .select()
        .single()

      if (error) throw error

      onSongUpdated(data)
      toast({
        title: "Song updated",
        description: "The worship song has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Worship Song</DialogTitle>
          <DialogDescription>Update the details for this worship song.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Song Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Amazing Grace"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist/Composer</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Chris Tomlin"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="G" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempo">Tempo</Label>
                <Input id="tempo" value={tempo} onChange={(e) => setTempo(e.target.value)} placeholder="120 BPM" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions or notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Updating..." : "Update Song"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
