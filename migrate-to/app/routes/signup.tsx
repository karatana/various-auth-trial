import { Label } from '../../components/forms/label'
import BackLink from '../../components/BackLink'
import { Input } from '../../components/forms/input'
// import { SubmitButton } from '../../components/forms/submit-button'
import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { client } from '../../utils/supabase/client'

import { verificationProcessPrefs } from '../cookies.server'

interface SignupData {
  error?: string
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const supabase = client()
  const formData = await request.formData()
  const phone = formData.get('phone')?.toString()

  if (!phone) {
    return json({ error: 'Phone are required' })
  }

  // https://supabase.com/docs/guides/auth/phone-login#signing-in-with-phone-otp
  const { error } = await supabase.auth.signInWithOtp({
    phone,
  })

  if (error) {
    console.error(error.code, error.message)
    return json({ error: 'Error trying to sign up' })
  }

  return redirect('/verify', {
    headers: {
      'Set-Cookie': await verificationProcessPrefs.serialize({
        phone,
        verificationProcess: 'sms',
      }),
    },
  })
}

export default function Signup() {
  const fetcher = useFetcher<SignupData>()
  const isSubmitting = fetcher.state === 'submitting'

  return (
    <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
      <BackLink to="/" />

      <fetcher.Form
        className="flex flex-col w-full justify-center gap-2 text-foreground [&>input]:mb-6 max-w-md"
        method="post"
      >
        <h1 className="text-2xl font-medium">Sign up/Log in</h1>
        <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
          <Label htmlFor="phone">Phone</Label>
          <Input name="phone" placeholder="+810812345678" required />
          <button
            className="bg-black h-8 flex items-center justify-center font-medium text-sm hover:bg-slate-800 transition-colors text-white rounded-md text-foreground"
            type="submit"
          >
            {isSubmitting ? 'Submitting...' : 'Sign up/Log in'}
          </button>
        </div>
        {fetcher.data && fetcher.data.error && (
          <div className="text-red-500 border-l-2 border-red-500 px-4">
            {fetcher.data.error}
          </div>
        )}
      </fetcher.Form>
    </div>
  )
}
