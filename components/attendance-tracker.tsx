'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Student = {
  id: number
  name: string
  attendanceCount: number
}

export default function AttendanceTracker() {
  const [students, setStudents] = useState<Student[]>([])
  const [newStudentName, setNewStudentName] = useState('')

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (newStudentName.trim()) {
      setStudents([
        ...students,
        { id: Date.now(), name: newStudentName.trim(), attendanceCount: 0 }
      ])
      setNewStudentName('')
    }
  }

  const markAttendance = (id: number) => {
    setStudents(students.map(student =>
      student.id === id ? { ...student, attendanceCount: student.attendanceCount + 1 } : student
    ))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Attendance Tracker</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addStudent} className="flex gap-2">
            <Input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Enter student name"
              className="flex-grow"
            />
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p>No students added yet.</p>
          ) : (
            <ul className="space-y-2">
              {students.map(student => (
                <li key={student.id} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <span>{student.name} - Attendance: {student.attendanceCount}</span>
                  <Button onClick={() => markAttendance(student.id)}>Mark Present</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

