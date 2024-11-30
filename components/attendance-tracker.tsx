'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'

type Student = {
  id: number
  name: string
  attendanceCount: number
}

// Initialize Supabase client with authentication and error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Update the SupabaseSession type to be more specific and remove any
type SupabaseSession = {
  user: {
    id: string;
    email?: string;
    // Add other user properties you need
  };
  access_token: string;
  refresh_token: string;
}

export default function AttendanceTracker() {
  const [students, setStudents] = useState<Student[]>([])
  const [newStudentName, setNewStudentName] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [session, setSession] = useState<SupabaseSession | null>(null)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error

      if (data) {
        setStudents(data.map(student => ({
          id: student.id,
          name: student.name,
          attendanceCount: student.attendance_count
        })))
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newStudentName.trim()) {
      try {
        // Log the attempt
        console.log('Attempting to add student:', newStudentName.trim())

        // Insert into Supabase
        const { data, error } = await supabase
          .from('students')
          .insert([
            { 
              name: newStudentName.trim(), 
              attendance_count: 0 
            }
          ])
          .select('*')  // Make sure to select all fields after insert

        // Log the response
        console.log('Supabase response:', { data, error })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        // Update local state with the data from Supabase
        if (data && data[0]) {
          setStudents(prevStudents => [
            ...prevStudents,
            { 
              id: data[0].id, 
              name: data[0].name, 
              attendanceCount: data[0].attendance_count 
            }
          ])
          setNewStudentName('')
        }
      } catch (error) {
        console.error('Detailed error:', error)
        alert('Failed to add student. Please check console for details.')
      }
    }
  }

  const markAttendance = async (id: number) => {
    try {
      const student = students.find(s => s.id === id)
      if (!student) return

      const newCount = student.attendanceCount + 1

      const { error } = await supabase
        .from('students')
        .update({ attendance_count: newCount })
        .eq('id', id)

      if (error) throw error

      setStudents(students.map(student =>
        student.id === id 
          ? { ...student, attendanceCount: newCount } 
          : student
      ))
    } catch (error) {
      console.error('Error updating attendance:', error)
      alert('Failed to mark attendance')
    }
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

