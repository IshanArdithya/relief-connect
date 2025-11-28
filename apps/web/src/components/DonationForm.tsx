"use client"

import { useState } from "react"
import { Check, Minus, Plus, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card"
import {
  DialogHeader,
  DialogFooter,
  DialogContent,
  Dialog,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb"
import SafetyBanner from "./SafetyBanner"

interface DonationItem {
  id: string
  category: string
  name: string
  quantity: number
}

interface DonationFormProps {
  userName?: string
  requestDetails?: {
    foods: string[]
    whenNeeded: string
    urgency: string
  }
}

export default function DonationForm({
  userName = "Alex User",
  requestDetails = {
    foods: ["Rice", "Meals"],
    whenNeeded: "XX",
    urgency: "High",
  },
}: DonationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [message, setMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [donations, setDonations] = useState<DonationItem[]>([
    { id: "1", category: "Essential Food & Water", name: "Clean Drinking Water", quantity: 0 },
    { id: "2", category: "Essential Food & Water", name: "Ready-to-eat Packs", quantity: 0 },
    { id: "3", category: "Essential Food & Water", name: "Canned Goods", quantity: 0 },
    { id: "4", category: "Essential Food & Water", name: "Rice & Grain", quantity: 0 },
  ])

  const totalItems = donations.reduce((sum, item) => sum + item.quantity, 0)

  const updateQuantity = (id: string, delta: number) => {
    setDonations(
      donations.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    )
  }

  const handleMakeDonation = () => {
    setShowSuccess(true)
  }

  const handleViewDonation = () => {
    setShowSuccess(false)
    router.push("/my-donations")
  }

  const handleSeeAllRequests = () => {
    setShowSuccess(false)
    router.push("/requests")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <main className="w-full max-w-6xl mx-auto">

        {/* Header */}
        <div className="mt-8 mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="cursor-pointer">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Make a Donation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Make a donation to <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">Help meet urgent needs in the community</p>
        </div>

        {/* ---------- MAIN CARD WRAPPER ---------- */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white p-8">
          {/* ------- STEP 1 ------- */}
          {currentStep === 1 && (
            <>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                {/* Left Column */}
                <div className="lg:col-span-2">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl font-semibold">What you can donate?</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Select items and quantities you wish to donate
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-6">
                    {Array.from(new Set(donations.map((d) => d.category))).map((category) => (
                      <div key={category}>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">{category}</h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {donations
                            .filter((d) => d.category === category)
                            .map((item) => (
                              <Card
                                key={item.id}
                                className="border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all rounded-xl"
                              >
                                <CardContent className="p-4">
                                  <div className="mb-4 flex flex-col">
                                    <p className="text-sm font-medium text-gray-600">{item.category}</p>
                                    <p className="text-base font-semibold text-gray-900">{item.name}</p>
                                  </div>

                                  {/* Quantity Selector */}
                                  <div className="flex items-center justify-between gap-3 rounded-md bg-white p-3 border border-gray-200">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.id, -1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>

                                    <span className="w-8 text-center font-bold text-gray-900">
                                      {item.quantity}
                                    </span>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.id, 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Request Summary */}
                <div>
                  <Card className="border border-gray-100 bg-white shadow-sm rounded-xl sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Request Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">Foods</p>
                        <p className="font-semibold text-gray-900 mt-1">{requestDetails.foods.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">When Needed</p>
                        <p className="font-semibold text-gray-900 mt-1">{requestDetails.whenNeeded}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">Urgency</p>
                        <p className="font-semibold text-gray-900 mt-1">{requestDetails.urgency}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-10 flex items-center justify-center gap-6">
                <span className="text-sm font-medium text-gray-600">Page 1 of 2</span>

                <Button onClick={() => setCurrentStep(2)} className="bg-blue-600 hover:bg-blue-700">
                  Next
                </Button>
              </div>
            </>
          )}

          {/* ------- STEP 2 ------- */}
          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl font-semibold">Your Donation Summary</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Review your donation before submitting
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-3">
                    {donations
                      .filter((d) => d.quantity > 0)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="text-sm text-gray-600">{item.category}</p>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                          </div>
                          <p className="text-lg font-bold text-blue-600">{item.quantity}x</p>
                        </div>
                      ))}

                    {donations.every((d) => d.quantity === 0) && (
                      <p className="text-center text-gray-500 py-4">No items selected</p>
                    )}
                  </div>

                  {/* Message Box */}
                  <div>
                    <CardDescription className="text-base font-semibold mb-2">
                      Attach a Message (Optional)
                    </CardDescription>
                    <Textarea
                      placeholder="Share your thoughts or encouragement..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-24 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <Card className="border border-gray-100 bg-white shadow-sm rounded-xl sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Request Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">Foods</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {requestDetails.foods.join(", ")}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">When Needed</p>
                        <p className="font-semibold text-gray-900 mt-1">{requestDetails.whenNeeded}</p>
                      </div>

                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">Urgency</p>
                        <p className="font-semibold text-gray-900 mt-1">{requestDetails.urgency}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-10 flex items-center justify-center gap-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Prev
                </Button>

                <span className="text-sm font-medium text-gray-600">Page 2 of 2</span>

                <Button
                  onClick={handleMakeDonation}
                  disabled={totalItems === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Make Donation
                </Button>
              </div>
            </>
          )}
        </Card>

      </main>

      {/* -------- SUCCESS DIALOG -------- */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Thank You!</DialogTitle>
            <DialogDescription className="text-center mt-2 text-base">
              Thank you for being such a great human being!
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col gap-3 pt-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleViewDonation}>
              View your Donation
            </Button>

            <Button variant="outline" className="w-full" onClick={handleSeeAllRequests}>
              See All Requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
