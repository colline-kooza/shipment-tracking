"use client"

import { Loader2, Lock, Mail } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import TextInput from "../FormInputs/TextInput"
import PasswordInput from "../FormInputs/PasswordInput"
import SubmitButton from "../FormInputs/SubmitButton"
import Logo from "../global/Logo"
import { toast } from "sonner"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm()
  const params = useSearchParams()
  const returnUrl = params.get("returnUrl") || "/dashboard"
  const [passErr, setPassErr] = useState("")
  const router = useRouter()

  async function onSubmit(data: any) {
    try {
      setLoading(true)
      setPassErr("")
      console.log("Attempting to sign in with credentials:", data)
      const loginData = await signIn("credentials", {
        ...data,
        redirect: false,
      })
      console.log("SignIn response:", loginData)
      if (loginData?.error) {
        setLoading(false)
        toast.error("Sign-in error: Check your credentials", {
          description: "Please also make sure you Verified your Account",
        })
        setPassErr("Wrong Credentials or Account Not Verified, Check again")
      } else {
        reset()
        setLoading(false)
        toast.success("Login Successful")
        setPassErr("")
        router.push(returnUrl)
      }
    } catch (error) {
      setLoading(false)
      console.error("Network Error:", error)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Blurry background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://img.freepik.com/free-photo/aerial-view-cargo-ship-cargo-container-harbor_335224-1380.jpg?ga=GA1.1.1036439435.1744115746&semt=ais_hybrid&w=740"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#0f2557]/70 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#0f2557]/10"></div>
        <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-[#0f2557]/10"></div>
        <div className="absolute left-1/2 top-0 h-1 w-1/3 -translate-x-1/2 transform bg-[#0f2557]"></div>

        <div className="relative z-10 px-8 py-10">
          <div className="mb-4 flex justify-center items-center">
            <Logo />
          </div>

          <div className="mb-3 text-center">
            <h1 className="mb-2 text-2xl font-bold text-[#0f2557]">Welcome Back</h1>
            <p className="text-sm text-gray-600">
              Sign in to <span className="font-medium text-[#0f2557]">TRAKIT Logistics</span>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              register={register}
              errors={errors}
              label="Email Address"
              name="email"
              icon={Mail}
              placeholder="Enter your email"
            />

            <PasswordInput
              register={register}
              errors={errors}
              label="Password"
              name="password"
              icon={Lock}
              placeholder="Enter your password"
              forgotPasswordLink="/forgot-password"
            />

            {passErr && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-xs text-red-600">{passErr}</p>
              </div>
            )}

            <SubmitButton
              title="Sign In"
              loadingTitle="Authenticating..."
              loading={loading}
              className="w-full bg-[#0f2557] hover:bg-[#183b7e] text-white"
              loaderIcon={Loader2}
              showIcon={false}
            />
          </form>

          <div className="mt-9 flex items-center justify-center space-x-2">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-xs font-medium text-gray-500">OR CONTINUE WITH</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* <div className="mt-6 grid grid-cols-2 gap-4">
            <Button
              onClick={() => signIn("google")}
              variant="outline"
              className="flex items-center justify-center gap-2 border-gray-200 bg-white hover:bg-gray-50"
              type="button"
            >
              <FaGoogle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Google</span>
            </Button>

            <Button
              onClick={() => signIn("github")}
              variant="outline"
              className="flex items-center justify-center gap-2 border-gray-200 bg-white hover:bg-gray-50"
              type="button"
            >
              <FaGithub className="h-4 w-4 text-gray-900" />
              <span className="text-sm font-medium">GitHub</span>
            </Button>
          </div> */}

          {/* <p className="mt-8 text-center text-sm text-gray-600 ">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-[#0f2557] hover:text-[#183b7e] transition-colors">
              Create Account
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  )
}
