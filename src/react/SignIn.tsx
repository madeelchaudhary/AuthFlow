'use client'

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
import { SignInSchema } from '@/src/validation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import * as React from 'react'
import EyeOff from '../components/ui/EyeOff'
import Eye from '../components/ui/Eye'
import Loader from '../components/ui/Loader'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SignInBaseSchema } from '../types'
import { cn } from '../utils'
import { Field } from './types'

interface Props {
  signIn: typeof AuthFlow.prototype.signIn
  pages?: {
    signup?: string
    redirectAfterSignIn?: string
  }
  schema?: SignInBaseSchema
  fields?: Field[]
  wrapperClassName?: string
  formClassName?: string
  buttonClassName?: string
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
  },
]

const SignIn = ({
  signIn,
  pages,
  fields = defaultFields,
  schema,
  formClassName,
  wrapperClassName,
  buttonClassName,
}: Props) => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const signUpPage = pages?.signup || '/signup'
  const redirectAfterSignIn = pages?.redirectAfterSignIn || '/'

  const validationSchema = schema || SignInSchema

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: fields.reduce(
      (acc, field) => {
        acc[field.name] = field.defaultValue || ''
        return acc
      },
      {} as Record<string, string>
    ),
  })

  const { push } = useRouter()

  const onSubmit = async (values: z.infer<typeof validationSchema>) => {
    setIsLoading(true)
    setError(null)

    const res = await signIn(values)

    if (res.status === 'error') {
      setError(res.error)
      setIsLoading(false)
      return
    }

    push(redirectAfterSignIn)
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
          <h2 className="authflow-font-semibold authflow-text-2xl authflow-mb-1">Sign In</h2>
          <p className="authflow-text-gray-500 authflow-text-sm authflow-font-normal">Welcome back! 👋</p>
        </div>

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
              {isLoading ? 'Signing In...' : 'Sign In'}{' '}
              {isLoading && <Loader className="authflow-mr-2 authflow-h-4 authflow-w-4 authflow-animate-spin" />}
            </Button>
          </form>
        </Form>

        <p className="authflow-text-center authflow-text-sm authflow-text-gray-500">
          Don&apos;t have an account?{' '}
          <Link className="authflow-text-blue-400 hover:authflow-underline" href={signUpPage}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignIn
