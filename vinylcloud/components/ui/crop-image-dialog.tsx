"use client"

import { useState, useRef } from "react"
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function CropImageDialog({ open, onOpenChange, imageUrl, onCropComplete, circular = true, aspectRatio = 1 }) {
  const [crop, setCrop] = useState({ unit: "%", width: 90, aspect: aspectRatio })
  const [completedCrop, setCompletedCrop] = useState(null)
  const imgRef = useRef(null)
  const previewCanvasRef = useRef(null)

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }

  const completeCrop = () => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext("2d")

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    )

    canvas.toBlob((blob) => {
      if (!blob) return
      const reader = new FileReader()
      reader.onload = () => {
        onCropComplete(reader.result)
        onOpenChange(false)
      }
      reader.readAsDataURL(blob)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Crop Image</DialogTitle>
        <div className="mt-4">
          {imageUrl && (
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circular}
            >
              <img
                ref={imgRef}
                src={imageUrl || "/placeholder.svg"}
                alt="Upload preview"
                onLoad={onImageLoad}
                className="max-h-[400px] object-contain"
              />
            </ReactCrop>
          )}
          <canvas ref={previewCanvasRef} style={{ display: "none" }} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={completeCrop}>Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
