import DonationForm from "../components/DonationForm";

export default function DonatePage() {
  return (
    <DonationForm
      userName="Chamara Ranavaka"
      requestDetails={{
        foods: ["Clean Drinking Water", "Ready-to-eat Packs"],
        whenNeeded: "ASAP",
        urgency: "High",
      }}
    />
  )
}
