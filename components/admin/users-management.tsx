"use client"

import { useState } from "react"
import type { User } from "@/types/user"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Ban, UserX, Search, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UsersManagementProps {
  users: User[]
  isLoading: boolean
  onToggleBan: (userId: string, ban: boolean) => Promise<void>
  onDeleteUser: (userId: string) => Promise<void>
}

export default function UsersManagement({ users, isLoading, onToggleBan, onDeleteUser }: UsersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-bold">User Management</h2>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{users.length} users</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="search"
          placeholder="Search users by username or email..."
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
      ) : filteredUsers.length > 0 ? (
        <div className="rounded-md border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-300">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant={user.isBanned ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => onToggleBan(user._id, !user.isBanned)}
                      >
                        {user.isBanned ? (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="mr-1 h-4 w-4" />
                            Ban
                          </>
                        )}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDeleteUser(user._id)}>
                        <UserX className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
          <p className="text-gray-400">No users found matching your search.</p>
        </div>
      )}
    </div>
  )
}
