"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Shield, Check, X } from "lucide-react"

interface TeamMember {
  id: string
  user_email: string
  role: "owner" | "editor" | "manager" | "viewer"
  granted_at: string
  is_active: boolean
}

interface Ambulance {
  id: string
  name: string
  email: string
  owner_email?: string
}

export default function AmbulanceTeamPage() {
  const router = useRouter()
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [ownerEmail, setOwnerEmail] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<"editor" | "manager" | "viewer">("viewer")
  const [adding, setAdding] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const ambulanceData = localStorage.getItem("shusto_ambulance_logged_in")
        const ownerData = localStorage.getItem("shusto_ambulance_owner_email")

        if (!ambulanceData || !ownerData) {
          router.push("/ambulance/login")
          return
        }

        const ambulance = JSON.parse(ambulanceData)
        setAmbulance(ambulance)
        setOwnerEmail(ownerData)

        const response = await fetch(
          `/api/provider/roles?provider_id=${ambulance.id}&provider_type=ambulance&user_email=${ownerData}`
        )
        const data = await response.json()
        if (response.ok) setTeamMembers(data.users || [])
      } catch (err: any) {
        setError(err.message || "Failed to load team")
      } finally {
        setLoading(false)
      }
    }
    loadTeam()
  }, [router])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!ambulance || !newMemberEmail) return

    setAdding(true)
    try {
      const response = await fetch("/api/provider/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: newMemberEmail,
          provider_id: ambulance.id,
          provider_type: "ambulance",
          role: newMemberRole,
          granted_by: ownerEmail,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(`${newMemberEmail} added as ${newMemberRole}`)
        setNewMemberEmail("")
        setNewMemberRole("viewer")
        const reloadResponse = await fetch(
          `/api/provider/roles?provider_id=${ambulance.id}&provider_type=ambulance&user_email=${ownerEmail}`
        )
        const reloadData = await reloadResponse.json()
        if (reloadResponse.ok) setTeamMembers(reloadData.users || [])
      } else {
        setError(data.error || "Failed to add member")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveMember = async (memberEmail: string) => {
    if (!ambulance) return
    if (!confirm(`Remove ${memberEmail} from team?`)) return
    setError("")
    try {
      const response = await fetch("/api/provider/roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: memberEmail,
          provider_id: ambulance.id,
          provider_type: "ambulance",
          revoked_by: ownerEmail,
        }),
      })
      if (response.ok) {
        setSuccess(`${memberEmail} removed from team`)
        setTeamMembers(teamMembers.filter(m => m.user_email !== memberEmail))
      } else {
        const data = await response.json()
        setError(data.error || "Failed to remove member")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-purple-100 text-purple-800"
      case "editor": return "bg-blue-100 text-blue-800"
      case "manager": return "bg-orange-100 text-orange-800"
      case "viewer": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/ambulance/dashboard"
            className="inline-flex items-center text-amber-600 hover:text-amber-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-2">{ambulance?.name}</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800 flex items-center">
            <X className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-amber-600" />
            Add Team Member
          </h2>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="team@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="viewer">Viewer (Read-only)</option>
                <option value="manager">Manager (Manage calls)</option>
                <option value="editor">Editor (Full team access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {adding ? "Adding..." : "Add Member"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Role Permissions:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Viewer:</strong> Can only view emergency calls and status</p>
              <p><strong>Manager:</strong> Can manage emergency calls and dispatching</p>
              <p><strong>Editor:</strong> Can manage team members and all operations</p>
              <p><strong>Owner:</strong> Full access including role management (you)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-amber-600" />
              Team Members ({teamMembers.length})
            </h2>
          </div>

          {teamMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No team members yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{member.user_email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Added {new Date(member.granted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {member.role !== "owner" && (
                    <button
                      onClick={() => handleRemoveMember(member.user_email)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
