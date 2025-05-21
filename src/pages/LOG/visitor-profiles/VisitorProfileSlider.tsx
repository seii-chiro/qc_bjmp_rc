import useEmblaCarousel from 'embla-carousel-react'
import VisitorProfileId from './visitorIdentityLandscape'
import { useCallback, useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useQuery } from '@tanstack/react-query'
import { useTokenStore } from '@/store/useTokenStore'
import { BASE_URL } from '@/lib/urls'

const VisitorProfileSlider = () => {
    const token = useTokenStore()?.token
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const [autoPlay, setAutoPlay] = useState(true)
    const autoPlayIntervalRef = useRef(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    // Get today's date in the format that matches your API response
    const today = new Date().toISOString().slice(0, 10) // This gives format like "2025-05-21"

    const { data: main_gate_logs, isLoading: main_gate_logs_loading } = useQuery({
        queryKey: ['main-gate-logs'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/visit-logs/main-gate-visits/?filter_today=true`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            })
            if (!res.ok) {
                throw new Error('Failed to fetch main gate logs')
            }
            return res.json()
        },
        refetchInterval: 30000,
    })

    // Only process logs when they're actually loaded
    // Make sure we're comparing dates in the same format - handling timezone issues
    const todayLogs = main_gate_logs_loading
        ? []
        : (main_gate_logs?.results?.filter(log => {
            // Check if created_at exists
            if (!log?.created_at) return false

            // Parse the date from the API format, accommodating timezone
            const logDate = new Date(log.created_at)
            const logDateStr = logDate.toISOString().slice(0, 10)

            return logDateStr === today
        }) || [])

    // Debug date formats
    useEffect(() => {
        if (!main_gate_logs_loading && main_gate_logs?.results?.length > 0) {
            console.log("Today's date we're checking for:", today)
            console.log("Sample log date:", main_gate_logs.results[0]?.created_at)
            console.log("Parsed sample date:", new Date(main_gate_logs.results[0]?.created_at).toISOString().slice(0, 10))
        }
    }, [main_gate_logs, main_gate_logs_loading, today])

    // Count occurrences of each ID number
    const idNumberCounts = todayLogs.reduce((acc, log) => {
        const id = log.id_number
        if (!id) return acc // Skip logs without ID numbers
        acc[id] = (acc[id] || 0) + 1
        return acc
    }, {})

    console.log("ID counts:", idNumberCounts)

    // Filter logs - include IDs that appear an odd number of times
    // but only include the first occurrence of each ID
    const filteredLogs = todayLogs.filter(
        (log, idx, arr) => {
            // Skip logs without ID numbers
            if (!log.id_number) return false

            // Include this log if:
            // 1. The ID appears an odd number of times AND
            // 2. This is the first occurrence of this ID in the array
            return idNumberCounts[log.id_number] % 2 === 1 &&
                arr.findIndex(l => l.id_number === log.id_number) === idx
        }
    )

    console.log("Filtered logs:", filteredLogs.length)

    useEffect(() => {
        if (!emblaApi) return
        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap())
        }
        emblaApi.on('select', onSelect)
        // Set initial index
        setSelectedIndex(emblaApi.selectedScrollSnap())
        return () => {
            emblaApi.off('select', onSelect)
        }
    }, [emblaApi])

    const handle = useFullScreenHandle()
    const contentRef = useRef(null)

    const downloadAsImage = async () => {
        if (!contentRef.current) return
        const canvas = await html2canvas(contentRef.current, { scale: 2 })
        const link = document.createElement("a")
        link.download = "identification.png"
        link.href = canvas.toDataURL("image/png")
        link.click()
    }

    const downloadAsPDF = async () => {
        if (!contentRef.current) return
        const canvas = await html2canvas(contentRef.current, { scale: 2 })
        const imgData = canvas.toDataURL("image/png")

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save("identification_landscape.pdf")
    }

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    // Toggle autoplay function
    const toggleAutoPlay = useCallback(() => {
        setAutoPlay(prev => !prev)
    }, [])

    // Setup autoplay functionality
    useEffect(() => {
        if (!emblaApi || filteredLogs.length <= 1) return

        if (autoPlay) {
            // Start autoplay with 5 second interval
            autoPlayIntervalRef.current = setInterval(() => {
                if (emblaApi.canScrollNext()) {
                    emblaApi.scrollNext()
                } else {
                    emblaApi.scrollTo(0) // Reset to first slide if at the end
                }
            }, 5000)
        } else if (autoPlayIntervalRef.current) {
            // Clear interval when autoplay is disabled
            clearInterval(autoPlayIntervalRef.current)
            autoPlayIntervalRef.current = null
        }

        // Cleanup function
        return () => {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current)
                autoPlayIntervalRef.current = null
            }
        }
    }, [emblaApi, autoPlay, filteredLogs.length])

    // Add keyboard event listener for arrow keys
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                scrollPrev()
                // Temporarily pause autoplay on manual navigation
                if (autoPlay && autoPlayIntervalRef.current) {
                    clearInterval(autoPlayIntervalRef.current)
                    autoPlayIntervalRef.current = setTimeout(() => {
                        setAutoPlay(true)
                    }, 5000) // Resume autoplay after 5 seconds
                }
            } else if (event.key === 'ArrowRight') {
                scrollNext()
                // Temporarily pause autoplay on manual navigation
                if (autoPlay && autoPlayIntervalRef.current) {
                    clearInterval(autoPlayIntervalRef.current)
                    autoPlayIntervalRef.current = setTimeout(() => {
                        setAutoPlay(true)
                    }, 5000) // Resume autoplay after 5 seconds
                }
            }
        }

        // Add event listener
        window.addEventListener('keydown', handleKeyDown)

        // Remove event listener on cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [scrollPrev, scrollNext, autoPlay])

    // Show loading state when data is being fetched
    if (main_gate_logs_loading) {
        return <div className="w-full h-full flex items-center justify-center">Loading visitor logs...</div>
    }

    return (
        <>
            <FullScreen handle={handle}>
                <div className="w-full h-full relative flex justify-center items-center overflow-x-hidden">
                    {/* Slide number overlay */}
                    {filteredLogs?.length > 0 && (
                        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-lg z-10">
                            {`${selectedIndex + 1} / ${filteredLogs?.length}`}
                        </div>
                    )}
                    <div className="w-full h-full" ref={emblaRef}>
                        <div className="flex h-full">
                            {filteredLogs?.length > 0 ? (
                                filteredLogs?.map((log, idx) => (
                                    <div key={log.id || idx} className="flex-[0_0_100%]" ref={idx === 0 ? contentRef : undefined}>
                                        <VisitorProfileId visitor_log={log} />
                                    </div>
                                ))
                            ) : (
                                <div className="flex-[0_0_100%] flex justify-center items-center text-gray-400">
                                    No visitors with odd entry counts today
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Left Arrow */}
                    <button
                        onClick={scrollPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-opacity duration-300 opacity-20 hover:opacity-100 bg-black/20 hover:bg-black/60 text-white"
                        aria-label="Previous slide"
                        disabled={filteredLogs.length <= 1}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={scrollNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-opacity duration-300 opacity-20 hover:opacity-100 bg-black/20 hover:bg-black/60 text-white"
                        aria-label="Next slide"
                        disabled={filteredLogs.length <= 1}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Play/Pause Button */}
                    {filteredLogs.length > 1 && (
                        <button
                            onClick={toggleAutoPlay}
                            className="absolute bottom-4 right-4 p-2 rounded-full transition-opacity duration-300 opacity-40 hover:opacity-100 bg-black/30 hover:bg-black/70 text-white"
                            aria-label={autoPlay ? "Pause automatic slideshow" : "Play automatic slideshow"}
                        >
                            {autoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </FullScreen>
            <div className="w-full flex gap-2 mt-2 relative mb-5">
                <button className="bg-gray-800 text-white p-2 rounded" onClick={handle.enter}>Fullscreen</button>
                <button className="bg-blue-600 text-white p-2 rounded" onClick={downloadAsImage}>Download as Image</button>
                <button className="bg-green-600 text-white p-2 rounded" onClick={downloadAsPDF}>Download as PDF</button>
                {filteredLogs.length > 1 && (
                    <button
                        className={`p-2 rounded flex items-center gap-1 ${autoPlay ? 'bg-red-500' : 'bg-green-500'} text-white`}
                        onClick={toggleAutoPlay}
                    >
                        {autoPlay ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
                    </button>
                )}
                <div className="absolute right-2 text-sm text-gray-500">
                    {todayLogs.length > 0 ? `${todayLogs.length} total logs today` : 'No logs for today'}
                </div>
            </div>
        </>
    )
}

export default VisitorProfileSlider