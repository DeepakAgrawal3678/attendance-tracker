'use server'

import { cookies } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Accept any email and password combination
  if (email && password) {
    cookies().set('user', email, { secure: true, httpOnly: true })
    return { success: true }
  }

  return { success: false, error: 'Invalid email or password' }
}

