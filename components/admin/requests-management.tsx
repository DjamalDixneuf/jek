"use client"

import { useState } from "react"
import type { MovieRequest } from "@/types/movie-request"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RequestsManagementProps {
  requests: MovieRequest[]
  isLoading: boolean
  onApproveRequest: (requestId: string) => Promise<void>
  onRejectRequest: (requestId: string) => Promise<void>
}

export default function RequestsManagement({
  requests,
  isLoading,
  onApproveRequest,
  onRejectRequest,
}: RequestsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRequests = requests.filter(
    (request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.comment && request.comment.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-bold">Movie Requests</h2>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{requests.length} requests</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="search"
          placeholder="Search requests by title or comment..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800/50 rounded animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="rounded-md border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>IMDB Link</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell className="font-medium">{request.title}</TableCell>
                  <TableCell>
                    <a
                      href={request.imdbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300"
                    >
                      IMDB
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>{request.userId}</TableCell>
                  <TableCell>{request.comment || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === "approved"
                          ? "bg-green-900/30 text-green-300"
                          : request.status === "rejected"
                            ? "bg-red-900/30 text-red-300"
                            : "bg-yellow-900/30 text-yellow-300"
                      }`}
                    >
                      {request.status || "pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {request.status === "pending" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => onApproveRequest(request._id)}>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onRejectRequest(request._id)}>
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
          <p className="text-gray-400">No movie requests found.</p>
        </div>
      )}
    </div>
  )
}
