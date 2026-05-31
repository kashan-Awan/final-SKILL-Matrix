"use client"

import { ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Maximize2, X } from "lucide-react"

interface FullscreenChartProps {
  children: ReactNode
  title: string
  description?: string
  triggerButton?: ReactNode
}

export default function FullscreenChart({ 
  children, 
  title, 
  description, 
  triggerButton 
}: FullscreenChartProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="ml-auto">
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        <div className="flex-1 p-6 pt-4 overflow-auto">
          <div className="h-[calc(95vh-8rem)]">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
