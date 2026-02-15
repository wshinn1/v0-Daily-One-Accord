import { BusinessPlanLoginForm } from "@/components/business-plan/business-plan-login-form"

export default function BusinessPlanLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Daily One Accord</h1>
          <p className="text-slate-600">Business Plan Access</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <BusinessPlanLoginForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">Access is restricted to invited users only</p>
      </div>
    </div>
  )
}
