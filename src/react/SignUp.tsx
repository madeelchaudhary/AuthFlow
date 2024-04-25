'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/src/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form'
import { Input } from '@/src/components/ui/input'
import AuthFlow from '@/src/auth-flow'
import { SignUpSchema } from '@/src/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import EyeOff from '../components/ui/EyeOff'
import Eye from '../components/ui/Eye'
import Loader from '../components/ui/Loader'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import * as React from 'react'
import { ClassName, Field } from './types'
import { cn } from '../utils'
import { SignUpBaseSchema } from '../types'

interface Props {
  signUp: typeof AuthFlow.prototype.signUp
  pages?: {
    signin?: string
    redirectAfterSignUp?: string
  }
  schema?: SignUpBaseSchema
  fields?: Field[]
  wrapperClassName?: ClassName
  formClassName?: ClassName
  buttonClassName?: ClassName
}

const defaultFields: Field[] = [
  {
    name: 'email',
    labelText: 'Email',
    type: 'email',
    placeholder: 'Email',
  },
  {
    name: 'password',
    labelText: 'Password',
    type: 'password',
    placeholder: 'Password',
    hint: 'Password must be at least 8 characters',
  },
  {
    name: 'confirmPassword',
    labelText: 'Confirm Password',
    type: 'password',
    placeholder: 'Confirm Password',
  },
]

const Signup = ({
  signUp,
  pages,
  fields = defaultFields,
  schema,
  wrapperClassName,
  formClassName,
  buttonClassName,
}: Props) => {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const signInPage = pages?.signin || '/signin'
  const redirectAfterSignUp = pages?.redirectAfterSignUp || '/signin'

  const { push } = useRouter()

  const validationSchema = schema || SignUpSchema

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof validationSchema>) => {
    setIsLoading(true)
    setError(null)

    const res = await signUp(values)

    if (res.status === 'success') {
      setMessage(res.message)
      setIsLoading(false)
      setTimeout(() => {
        push(redirectAfterSignUp)
      }, 500)
      return
    }

    if (res.status === 'error') {
      setError(res.error)
    }

    setIsLoading(false)
  }

  return (
    <div className="authflow-flex authflow-items-center authflow-justify-center">
      <div
        className={cn(
          'authflow-w-full authflow-shadow-xl authflow-p-8 authflow-md:p-16 authflow-rounded-xl authflow-max-w-sm md:authflow-max-w-md lg:authflow-max-w-lg',
          wrapperClassName
        )}
      >
        <div className="authflow-text-center authflow-mb-4">
          <h2 className="authflow-font-semibold authflow-text-2xl authflow-mb-1">Sign Up</h2>
          <p className="authflow-text-gray-500 authflow-text-sm authflow-font-normal">Be part of our community 🎉</p>
        </div>

        {message && <p className="authflow-text-green-500 authflow-text-sm authflow-text-center">{message}</p>}

        <Form {...form}>
          <form
            className={cn('authflow-py-4 authflow-space-y-5 authflow-w-full', formClassName)}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {fields.map((item) => (
              <FormField
                key={item.name}
                name={item.name as any}
                defaultValue={item.defaultValue}
                disabled={item.disabled}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    {item.labelText && <FormLabel>{item.labelText}</FormLabel>}
                    {item.name === 'password' || item.name === 'confirmPassword' ? (
                      <div className="authflow-relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={item.placeholder}
                            {...field}
                            className={item.className}
                          />
                        </FormControl>
                        {item.name === 'password' && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="authflow-absolute authflow-right-3 authflow-top-2.5"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        )}
                      </div>
                    ) : (
                      <FormControl>
                        <Input type={item.type} placeholder={item.placeholder} {...field} className={item.className} />
                      </FormControl>
                    )}
                    {item.hint && <FormDescription>{item.hint}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            {error && <p className="authflow-text-destructive authflow-text-sm authflow-text-center">{error}</p>}

            <Button
              type="submit"
              variant="default"
              className={cn(
                'authflow-text-white authflow-w-full focus:authflow-ring-4 focus:authflow-outline-none authflow-rounded-lg authflow-px-5 authflow-py-2.5 authflow-text-center authflow-flex authflow-transition-colors',
                buttonClassName
              )}
              disabled={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}{' '}
              {isLoading && <Loader className="authflow-mr-2 authflow-h-4 authflow-w-4 authflow-animate-spin" />}
            </Button>
          </form>
        </Form>

        <p className="authflow-text-center authflow-text-sm authflow-text-gray-500">
          Already have an account?{' '}
          <Link className="authflow-text-blue-400 hover:authflow-underline" href={signInPage}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
