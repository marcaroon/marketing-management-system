"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/firebase/auth";
import { loginFormSchema, type LoginFormValues } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    const result = await signIn(data.email, data.password);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Branding */}
      <div className="relative hidden w-1/2 lg:flex lg:flex-col lg:justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/20" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-white/15" />
          <div className="absolute left-1/3 top-1/3 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute bottom-1/3 left-10 h-32 w-96 rotate-12 rounded-3xl bg-white/10" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
            <span className="text-2xl font-bold text-white">TQ</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
            Marketing<br />Management<br />System
          </h1>
          <p className="mt-4 max-w-md text-base text-blue-100/80 leading-relaxed">
            Kelola prospek, klien, dan event marketing perusahaan konsultan Anda
            secara efisien dalam satu platform terpadu.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { title: "Prospek & Klien", desc: "Pendataan dan monitoring" },
              { title: "Event Marketing", desc: "BG & BV management" },
              { title: "Follow Up", desc: "Tracking otomatis" },
              { title: "Dashboard", desc: "Analitik real-time" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="text-xs text-blue-200/80">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 px-12 pb-8 xl:px-16">
          <p className="text-xs text-blue-200/60">
            © 2026 Marketing Management System. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
              <span className="text-lg font-bold text-white">TQ</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Marketing Management System</h2>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Masuk ke akun Anda</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Gunakan email dan password untuk masuk ke sistem.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nama@perusahaan.com"
                        type="email"
                        autoComplete="email"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Masukkan password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="h-11 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-blue-600 to-blue-700 font-medium text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Hubungi admin jika Anda belum memiliki akun atau lupa password.
          </p>
        </div>
      </div>
    </div>
  );
}
