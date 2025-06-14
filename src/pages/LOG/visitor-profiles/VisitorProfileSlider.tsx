/* eslint-disable @typescript-eslint/no-explicit-any */
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
import dayjs from "dayjs";
import clsx from 'clsx'
import { useSystemSettingsStore } from '@/store/useSystemSettingStore'

const VisitorProfileSlider = () => {
    const token = useTokenStore()?.token
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const [autoPlay, setAutoPlay] = useState(true)
    const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const logRefetchInterval = useSystemSettingsStore((state) => state.logRefetchInterval);
    const didInitialLoad = useRef(false);

    const { data: main_gate_logs_raw, isLoading: main_gate_logs_loading, isFetching } = useQuery({
        queryKey: ['main-gate-logs', logRefetchInterval],
        queryFn: async () => {
            // /api/visit-logs/main-gate-visits/?filter_today=true
            // /api/visit-logs/main-gate-visits/
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
        refetchInterval: +logRefetchInterval * 1000 || 30000,
    })

    //Daily if filter_today=true
    const main_gate_logs = main_gate_logs_raw?.results || []

    // const todayLogs = main_gate_logs?.filter((log: { timestamp_out: string; timestamp_in: string }) => {
    //     if (log.timestamp_out) return false;

    //     const logDate = log.timestamp_in ? new Date(log.timestamp_in) : null;
    //     if (!logDate) return false;

    //     const today = new Date();
    //     return (
    //         logDate.getFullYear() === today.getFullYear() &&
    //         logDate.getMonth() === today.getMonth() &&
    //         logDate.getDate() === today.getDate()
    //     );
    // });

    const seen = new Set();
    const filteredLogs = main_gate_logs?.filter((log: { timestamp_out: string; timestamp_in: string; visitor: any }) => {
        // Uncomment if those who logged out shouldn't be displayed.
        // if (log.timestamp_out) return false;

        // Parse timestamp_in as local time
        const logDate = log.timestamp_in ? new Date(log.timestamp_in) : null;
        if (!logDate) return false;

        const today = new Date();
        const isToday =
            logDate.getFullYear() === today.getFullYear() &&
            logDate.getMonth() === today.getMonth() &&
            logDate.getDate() === today.getDate();

        // Only include if not already seen
        if (isToday && !seen.has(log?.visitor?.person?.id)) {
            seen.add(log?.visitor?.person?.id);
            return true;
        }
        return false;
    });

    useEffect(() => {
        if (!main_gate_logs_loading) {
            didInitialLoad.current = true;
        }
    }, [main_gate_logs_loading]);

    useEffect(() => {
        if (didInitialLoad.current && !isFetching) {
            setLastRefreshed(new Date());
        }
    }, [isFetching]);

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

        const element = contentRef.current as HTMLElement

        // Wait for any pending renders/animations
        await new Promise(resolve => setTimeout(resolve, 100))

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                onclone: (clonedDoc) => {
                    // Ensure the cloned element has the same dimensions
                    const clonedElement = clonedDoc.querySelector('#visitor-profile-export')
                    if (clonedElement) {
                        (clonedElement as HTMLElement).style.width = element.scrollWidth + 'px';
                        (clonedElement as HTMLElement).style.height = element.scrollHeight + 'px';
                    }
                }
            })

            const link = document.createElement("a")
            link.download = `visitor-identification-${new Date().toISOString().split('T')[0]}.png`
            link.href = canvas.toDataURL("image/png", 1.0)
            link.click()
        } catch (error) {
            console.error('Error generating image:', error)
            alert('Error generating image. Please try again.')
        }
    }

    const downloadAsPDF = async () => {
        if (!contentRef.current) return

        const element = contentRef.current as HTMLElement

        // Wait for any pending renders/animations
        await new Promise(resolve => setTimeout(resolve, 100))

        try {
            // Get the natural dimensions of the content
            const contentWidth = element.scrollWidth
            const contentHeight = element.scrollHeight

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: contentWidth,
                height: contentHeight,
                scrollX: 0,
                scrollY: 0,
                windowWidth: contentWidth,
                windowHeight: contentHeight,
                onclone: (clonedDoc) => {
                    // Ensure the cloned element has the same dimensions
                    const clonedElement = clonedDoc.querySelector('#visitor-profile-export')
                    if (clonedElement) {
                        (clonedElement as HTMLElement).style.width = contentWidth + 'px';
                        (clonedElement as HTMLElement).style.height = contentHeight + 'px';
                    }
                }
            })

            const imgData = canvas.toDataURL("image/png", 1.0)

            // Calculate PDF dimensions - use A4 as base and scale appropriately
            const imgWidth = canvas.width / 2  // Divide by 2 because we used scale: 2
            const imgHeight = canvas.height / 2

            // Convert pixels to mm (assuming 96 DPI)
            const mmWidth = (imgWidth * 25.4) / 96
            const mmHeight = (imgHeight * 25.4) / 96

            // Determine orientation based on aspect ratio
            const isLandscape = mmWidth > mmHeight

            // Create PDF with custom dimensions
            const pdf = new jsPDF({
                orientation: isLandscape ? "landscape" : "portrait",
                unit: "mm",
                format: [mmWidth, mmHeight],
            })

            // Add image to PDF - fill entire page
            pdf.addImage(imgData, "PNG", 0, 0, mmWidth, mmHeight, '', 'FAST')

            // Save with timestamp
            const timestamp = new Date().toISOString().split('T')[0]
            pdf.save(`visitor-identification-${timestamp}.pdf`)

        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Error generating PDF. Please try again.')
        }
    }

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    // Toggle autoplay function
    const toggleAutoPlay = useCallback(() => {
        setAutoPlay(prev => !prev)
    }, [])

    // Setup autoplay functionality
    useEffect(() => {
        if (!emblaApi || filteredLogs?.length <= 1) return

        if (autoPlay) {
            // Start autoplay with 5 second interval
            autoPlayIntervalRef.current = setInterval(() => {
                if (emblaApi.canScrollNext()) {
                    emblaApi.scrollNext()
                } else {
                    emblaApi.scrollTo(0)
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
    }, [emblaApi, autoPlay, filteredLogs?.length])

    // Add keyboard event listener for arrow keys
    useEffect(() => {
        const handleKeyDown = (event: { key: string }) => {
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
                <div
                    id='visitor-profile-export'
                    className={clsx('w-full relative flex justify-center items-center overflow-x-hidden', handle?.active ? 'h-full' : 'h-[85vh]')}>
                    {/* Slide number overlay */}
                    {(filteredLogs?.length > 0 || lastRefreshed) && (
                        <div className="w-[95%] absolute top-4 flex justify-between gap-2 z-10">
                            {filteredLogs?.length > 0 && (
                                <div className="bg-black/60 text-white px-3 py-1 rounded text-lg font-semibold">
                                    {`${selectedIndex + 1} / ${filteredLogs?.length}`}
                                </div>
                            )}
                            {lastRefreshed && (
                                <div className="bg-black/60 font-semibold text-white px-3 py-1 rounded text-base flex items-center">
                                    Last refreshed: {dayjs(lastRefreshed).format("hh:mm:ss A")}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="w-full h-full" ref={emblaRef}>
                        <div className="flex h-full">
                            {filteredLogs?.length > 0 ? (
                                filteredLogs?.map((log: any, idx: number) => (
                                    <div
                                        key={log.id || idx}
                                        className="flex-[0_0_100%]"
                                        ref={idx === selectedIndex ? contentRef : undefined}
                                    >
                                        <VisitorProfileId visitor_log={log} visitHistory={main_gate_logs_raw?.results} />
                                    </div>
                                ))
                            ) : (
                                <div className="flex-[0_0_100%] flex justify-center text-xl font-semibold items-center text-gray-400 text-center">
                                    No visitors for today.
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Left Arrow */}
                    <button
                        onClick={scrollPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-opacity duration-300 opacity-20 hover:opacity-100 bg-black/20 hover:bg-black/60 text-white"
                        aria-label="Previous slide"
                        disabled={filteredLogs?.length <= 1}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={scrollNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-opacity duration-300 opacity-20 hover:opacity-100 bg-black/20 hover:bg-black/60 text-white"
                        aria-label="Next slide"
                        disabled={filteredLogs?.length <= 1}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Play/Pause Button */}
                    {filteredLogs?.length > 1 && (
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
                {filteredLogs?.length > 1 && (
                    <button
                        className={`p-2 rounded flex items-center gap-1 ${autoPlay ? 'bg-red-500' : 'bg-green-500'} text-white`}
                        onClick={toggleAutoPlay}
                    >
                        {autoPlay ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
                    </button>
                )}
                <div className="absolute right-2 text-sm text-gray-500">
                    {/* {todayLogs?.length > 0 ? `${todayLogs?.length} total logs today` : 'No logs for today'}  old - uncomment when fetching the entire log*/}
                    {main_gate_logs?.length > 0 ? `${main_gate_logs?.length} total logs today` : 'No logs for today'}
                </div>
            </div>
        </>
    )
}

export default VisitorProfileSlider