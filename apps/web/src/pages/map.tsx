'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import dynamic from 'next/dynamic'
import { Button } from 'apps/web/src/components/ui/button'
import { Label } from 'apps/web/src/components/ui/label'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from 'apps/web/src/components/ui/drawer'
import type { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import type { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto'
import { Urgency, HelpRequestCategory } from '@nx-mono-repo-deployment-test/shared/src/enums'
import { Filter, ArrowLeft } from 'lucide-react'
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_DISTRICTS,
  DISTRICT_COORDINATES,
} from '../data/sri-lanka-locations'
import { helpRequestService, campService } from '../services'

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/Map'), { ssr: false })

export default function MapDashboard() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([])
  const [camps, setCamps] = useState<CampResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<{
    province?: string
    district?: string
    emergencyLevel?: Urgency
    type?: 'individual' | 'group'
  }>({})
  const [appliedFilters, setAppliedFilters] = useState<{
    province?: string
    district?: string
    emergencyLevel?: Urgency
    type?: 'individual' | 'group'
  }>({})
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718])
  const [mapZoom, setMapZoom] = useState(8)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Read filters from query params on initial load
  useEffect(() => {
    const { province, district, urgency, type } = router.query
    if (province || district || urgency || type) {
      const initialFilters = {
        province: province as string | undefined,
        district: district as string | undefined,
        emergencyLevel: urgency as Urgency | undefined,
        type: type as 'individual' | 'group' | undefined,
      }
      setTempFilters(initialFilters)
      setAppliedFilters(initialFilters)
    }
  }, [router.query])

  // Use requests as-is (coordinates should come from API)
  const requestsWithMockCoords = useMemo(() => {
    return helpRequests
  }, [helpRequests])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch help requests from API
      const helpRequestsResponse = await helpRequestService.getAllHelpRequests({
        district: appliedFilters.district,
        urgency: appliedFilters.emergencyLevel,
      })

      // Fetch camps from API
      const campsResponse = await campService.getAllCamps({
        district: appliedFilters.district,
      })

      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data)
      } else {
        console.error('[MapPage] Failed to load help requests:', helpRequestsResponse.error)
        setHelpRequests([])
      }

      if (campsResponse.success && campsResponse.data) {
        setCamps(campsResponse.data)
      } else {
        console.error('[MapPage] Failed to load camps:', campsResponse.error)
        setCamps([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [appliedFilters.district, appliedFilters.emergencyLevel])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Update map center when applied filters change
  useEffect(() => {
    if (appliedFilters.district && DISTRICT_COORDINATES[appliedFilters.district]) {
      setMapCenter(DISTRICT_COORDINATES[appliedFilters.district])
      setMapZoom(10)
    } else if (appliedFilters.province) {
      // Center on first district of province
      const districts = SRI_LANKA_DISTRICTS[appliedFilters.province]
      if (districts && districts.length > 0 && DISTRICT_COORDINATES[districts[0]]) {
        setMapCenter(DISTRICT_COORDINATES[districts[0]])
        setMapZoom(9)
      }
    } else {
      setMapCenter([7.8731, 80.7718])
      setMapZoom(8)
    }
  }, [appliedFilters.district, appliedFilters.province])

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters })
    // Update URL with filters
    const params = new URLSearchParams()
    if (tempFilters.province) params.set('province', tempFilters.province)
    if (tempFilters.district) params.set('district', tempFilters.district)
    if (tempFilters.emergencyLevel) params.set('urgency', tempFilters.emergencyLevel)
    if (tempFilters.type) params.set('type', tempFilters.type)
    router.push(`/map?${params.toString()}`, undefined, { shallow: true })
    setIsDrawerOpen(false)
  }

  const handleViewRequestDetails = (request: HelpRequestResponseDto) => {
    const requestData = encodeURIComponent(JSON.stringify(request))
    router.push(`/request-details?requestData=${requestData}`)
  }

  const filteredRequests = useMemo(() => {
    let filtered = requestsWithMockCoords

    // Filter by district
    if (appliedFilters.district) {
      filtered = filtered.filter((request) =>
        request.approxArea?.toLowerCase().includes(appliedFilters.district!.toLowerCase())
      )
    }

    // Filter by province
    if (appliedFilters.province && !appliedFilters.district) {
      const districts = SRI_LANKA_DISTRICTS[appliedFilters.province] || []
      filtered = filtered.filter((request) =>
        districts.some((district) =>
          request.approxArea?.toLowerCase().includes(district.toLowerCase())
        )
      )
    }

    // Filter by urgency
    if (appliedFilters.emergencyLevel) {
      filtered = filtered.filter((request) => request.urgency === appliedFilters.emergencyLevel)
    }

    // Filter by type
    if (appliedFilters.type === 'individual') {
      filtered = filtered.filter((request) => {
        const peopleMatch = request.shortNote?.match(/People:\s*(\d+)/)
        return peopleMatch && Number.parseInt(peopleMatch[1]) <= 10
      })
    } else if (appliedFilters.type === 'group') {
      filtered = filtered.filter((request) => {
        const peopleMatch = request.shortNote?.match(/People:\s*(\d+)/)
        return peopleMatch && Number.parseInt(peopleMatch[1]) > 10
      })
    }

    return filtered
  }, [requestsWithMockCoords, appliedFilters])

  const availableDistricts = tempFilters.province
    ? SRI_LANKA_DISTRICTS[tempFilters.province] || []
    : Object.values(SRI_LANKA_DISTRICTS).flat()

  const DesktopFiltersBar = () => (
    <nav className="hidden md:block absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">{t('filters')}</span>
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-3">
            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm min-w-[150px]"
              value={tempFilters.province || ''}
              onChange={(e) => {
                const province = e.target.value || undefined
                setTempFilters({
                  ...tempFilters,
                  province,
                  district: undefined,
                })
              }}
            >
              <option value="">All Provinces</option>
              {SRI_LANKA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm min-w-[150px]"
              value={tempFilters.district || ''}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  district: e.target.value || undefined,
                })
              }
              disabled={!tempFilters.province}
            >
              <option value="">All Districts</option>
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm min-w-[130px]"
              value={tempFilters.emergencyLevel || ''}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  emergencyLevel: e.target.value ? (e.target.value as Urgency) : undefined,
                })
              }
            >
              <option value="">All Levels</option>
              <option value={Urgency.LOW}>Low</option>
              <option value={Urgency.MEDIUM}>Medium</option>
              <option value={Urgency.HIGH}>High</option>
            </select>

            <select
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm min-w-[120px]"
              value={tempFilters.type || ''}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  type: e.target.value ? (e.target.value as 'individual' | 'group') : undefined,
                })
              }
            >
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>

            <Button onClick={handleApplyFilters} className="h-10">
              Apply Filters
            </Button>

            <Button variant="outline" onClick={() => router.push('/#requests')} className="h-10">
              View Requests List
            </Button>
          </div>
        </div>
        {appliedFilters.district || appliedFilters.province ? (
          <div className="mt-2 text-sm text-gray-600">
            Showing:{' '}
            {appliedFilters.district
              ? appliedFilters.district
              : appliedFilters.province
                ? appliedFilters.province
                : 'All Locations'}
          </div>
        ) : null}
      </div>
    </nav>
  )

  const MobileBottomBar = () => (
    <div
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] transition-all duration-300 ease-out"
      style={{ transform: isDrawerOpen ? 'translateY(150px)' : 'translateY(0)' }}
    >
      <div className="flex items-center justify-around bg-white/90 backdrop-blur-xl shadow-lg border border-gray-200 rounded-2xl py-3 px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-[11px] font-medium">Back</span>
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300/60"></div>

        {/* Filters Button */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-transparent"
            >
              <Filter className="h-5 w-5" />
              <span className="text-[11px] font-medium">Filters</span>
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[45vh]">
            <DrawerHeader className="text-center">
              <DrawerTitle>Filter Map</DrawerTitle>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="province-select">Province</Label>
                <select
                  id="province-select"
                  className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                  value={tempFilters.province || ''}
                  onChange={(e) => {
                    const province = e.target.value || undefined
                    setTempFilters({
                      ...tempFilters,
                      province,
                      district: undefined,
                    })
                  }}
                >
                  <option value="">{t('allProvinces')}</option>
                  {SRI_LANKA_PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district-select">District</Label>
                <select
                  id="district-select"
                  className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50"
                  value={tempFilters.district || ''}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      district: e.target.value || undefined,
                    })
                  }
                  disabled={!tempFilters.province}
                >
                  <option value="">{t('allDistricts')}</option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency-select">Urgency Level</Label>
                <select
                  id="urgency-select"
                  className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                  value={tempFilters.emergencyLevel || ''}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      emergencyLevel: e.target.value ? (e.target.value as Urgency) : undefined,
                    })
                  }
                >
                  <option value="">{t('allLevels')}</option>
                  <option value={Urgency.LOW}>{t('low')}</option>
                  <option value={Urgency.MEDIUM}>{t('medium')}</option>
                  <option value={Urgency.HIGH}>{t('high')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-select">Type</Label>
                <select
                  id="type-select"
                  className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                  value={tempFilters.type || ''}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      type: e.target.value ? (e.target.value as 'individual' | 'group') : undefined,
                    })
                  }
                >
                  <option value="">{t('allTypes')}</option>
                  <option value="individual">{t('individual')}</option>
                  <option value="group">{t('group')}</option>
                </select>
              </div>
            </div>
            <DrawerFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTempFilters({})
                  setAppliedFilters({})
                  router.push('/map', undefined, { shallow: true })
                  setIsDrawerOpen(false)
                }}
                className="w-full"
              >
                Clear
              </Button>

              <Button onClick={handleApplyFilters} className="w-full">
                Apply
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Help Map - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50 relative">
        {isMobile ? <MobileBottomBar /> : <DesktopFiltersBar />}
        {/* Map Section */}
        <div className="h-screen pt-0 md:pt-24 pb-0 md:pb-0 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-gray-600">Loading map...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
              <div className="text-red-600">Error: {error}</div>
            </div>
          )}
          {!loading && !error && (
            <div className="h-full w-full">
              <Map
                helpRequests={filteredRequests}
                camps={camps}
                center={mapCenter}
                zoom={mapZoom}
                onRequestClick={handleViewRequestDetails}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}
