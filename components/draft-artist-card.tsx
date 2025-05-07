"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import { format, formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, Trash, Clock, Music2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function DraftArtistCard({ draft, onEdit, onDelete }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"

    try {
      const date = new Date(dateString)
      return format(date, "MMM d, yyyy 'at' h:mm a")
    } catch (e) {
      return "Invalid date"
    }
  }

  const getRelativeTime = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return ""
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        <div className="relative w-full aspect-square">
          {draft.imageUrl ? (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 border-8 border-gray-200 dark:border-gray-800 rounded-t-md z-10"></div>
              <img
                src={draft.imageUrl || "/placeholder.png"}
                alt={`${draft.name || "Untitled draft"} preview`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png"
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-black dark:bg-zinc-900 flex items-center justify-center">
              <Music2 className="h-16 w-16 text-white" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white">Draft</Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-primary">{draft.name || "Untitled Artist"}</h3>
              {draft.genre && <p className="text-sm text-muted-foreground">{draft.genre}</p>}
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{getRelativeTime(draft.updatedAt)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Last updated: {formatDate(draft.updatedAt)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => onEdit(draft)}
                title="Edit draft"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                title="Delete draft"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button className="w-full mt-3" size="sm" onClick={() => onEdit(draft)}>
            Continue Editing
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
