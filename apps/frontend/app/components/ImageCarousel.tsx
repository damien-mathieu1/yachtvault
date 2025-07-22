"use client"

import { useState, useEffect, useRef } from "react"
import { useSwipeable } from "react-swipeable"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeThumbnail = thumbnailContainerRef.current.children[currentIndex] as HTMLElement
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const nextZoomedImage = () => {
    if (zoomedIndex !== null) {
      setZoomedIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0))
    }
  }

  const prevZoomedImage = () => {
    if (zoomedIndex !== null) {
      setZoomedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0))
    }
  }

  const openZoom = (index: number) => {
    setZoomedIndex(index)
  }

  const closeZoom = () => {
    setZoomedIndex(null)
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const zoomedHandlers = useSwipeable({
    onSwipedLeft: () => nextZoomedImage(),
    onSwipedRight: () => prevZoomedImage(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  return (
    <div className="w-full mx-auto">
      <div className="relative">
        <div {...handlers} className="relative w-full h-64 md:h-[450px] rounded-lg overflow-hidden bg-muted touch-pan-y">
          <Image
            key={currentIndex}
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`${title} - Image ${currentIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300 cursor-pointer"
            onClick={() => openZoom(currentIndex)}
          >
            <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div ref={thumbnailContainerRef} className="flex items-center mt-2 pl-2 pt-1.25 space-x-2 overflow-x-auto pb-2 hide-scrollbar">
          {images.map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${index === currentIndex ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100"}`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${title} - Thumbnail ${index + 1}`}
                width={80}
                height={60}
                className="w-20 h-15 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={zoomedIndex !== null} onOpenChange={(open) => !open && closeZoom()}>
        <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0 bg-black/95 border-none">
          {zoomedIndex !== null && (
            <div {...zoomedHandlers} className="relative w-full h-full flex items-center justify-center">
              <Image
                src={images[zoomedIndex] || "/placeholder.svg"}
                alt={`${title} - Zoomed Image ${zoomedIndex + 1}`}
                width={1920}
                height={1080}
                className="max-w-full max-h-[90vh] object-contain"
              />

              {images.length > 1 && (
                <>
                  <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white" onClick={prevZoomedImage}>
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white" onClick={nextZoomedImage}>
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white/80 text-lg">
                  {zoomedIndex + 1} / {images.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>
    </div>
  )
}
