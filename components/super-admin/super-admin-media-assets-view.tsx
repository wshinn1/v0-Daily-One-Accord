"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen } from "lucide-react"
import { GoogleDriveFileBrowser } from "@/components/media/google-drive-file-browser"

interface Tenant {
  id: string
  name: string
  google_drive_url: string | null
}

interface SuperAdminMediaAssetsViewProps {
  tenants: Tenant[]
  selectedTenant?: Tenant
}

export function SuperAdminMediaAssetsView({ tenants, selectedTenant }: SuperAdminMediaAssetsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTenantChange = (tenantId: string) => {
    router.push(`/super-admin/media-assets?tenant=${tenantId}`)
  }

  const extractFolderId = (url: string | null): string | null => {
    if (!url) return null
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  }

  const folderId = selectedTenant ? extractFolderId(selectedTenant.google_drive_url) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Assets</h1>
          <p className="text-muted-foreground">View and manage Google Drive media for church tenants</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Church Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTenant?.id || ""} onValueChange={handleTenantChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a church tenant..." />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTenant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              {selectedTenant.name} - Media Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {folderId ? (
              <GoogleDriveFileBrowser folderId={folderId} />
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Google Drive Configured</h3>
                <p className="text-sm text-muted-foreground">
                  This tenant hasn't set up their Google Drive integration yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedTenant && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Tenant</h3>
              <p className="text-sm text-muted-foreground">
                Choose a church tenant from the dropdown above to view their media assets.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
