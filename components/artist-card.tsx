"use client"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music2, ExternalLink, User, X } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import ArtistEditForm from "./artist-edit-form"
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
import { Badge } from "@/components/ui/badge"
import { toggleSaveArtist } from "@/lib/artist-service"
import { useToast } from "@/components/ui/use-toast"

export default function ArtistCard({ artist, currentUser, onGenreClick, onUpdate, onDelete }) {
  // …[all your existing hooks and handlers]…

  return (
    <>
      <Card className="hover:shadow-md transition-shadow overflow-hidden cursor-pointer" onClick={handleCardClick}>
        {/* …[card content as before]… */}
      </Card>

      {/* Artist Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[85vh] my-auto">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="absolute right-4 top-4 z-10 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>

          {/* …[rest of the details modal body]… */}
        </DialogContent>
      </Dialog>

      {/* Links Dialog */}
      <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
        <DialogContent className="sm:max-w-[400px] max-h-[80vh]">
          <DialogClose asChild>
            <Button variant="ghost" className="absolute right-4 top-4 z-10">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>

          <DialogHeader className="text-center">
            <DialogTitle>Open Artist Link</DialogTitle>
            <DialogDescription>Choose which platform to open for {artist.name}</DialogDescription>
          </DialogHeader>

          {/* …[links list]… */}

          <div className="flex justify-end pt-2 border-t">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogClose asChild>
            <Button variant="ghost" className="absolute right-4 top-4 z-10">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>

          <DialogHeader>
            <DialogTitle>Edit Artist Details</DialogTitle>
            <DialogDescription>Update information for {artist.name}</DialogDescription>
          </DialogHeader>

          <ArtistEditForm
            artist={artist}
            onSave={(updatedArtist) => {
              onUpdate(updatedArtist)
              setIsEditModalOpen(false)
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {artist.name} from the library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(artist.id)
                setIsDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global keyframes for heart animations (unchanged) */}
      <style jsx global>{`
        @keyframes heartBeat { /* ... */ }
        @keyframes heartPulse { /* ... */ }
        .heart-animation { animation: heartBeat 0.5s ease-in-out; }
        .heart-pulse { animation: heartPulse 0.5s ease-in-out; transform-origin: center; color: #ff4081; }
        @keyframes float { /* ... */ }
        .floating-heart { /* ... */ }
      `}</style>
    </>
  )
}
