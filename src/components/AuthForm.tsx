import { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2 } from "lucide-react";
import { authSchema, type AuthFormData } from '@/lib/validations';
import { sanitizeInput, authRateLimiter, checkPasswordStrength } from '@/lib/security';

const signInSchema = authSchema.omit({ name: true });
const signUpSchemaWithConfirm = authSchema.extend({
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ isStrong: false, score: 0, feedback: [] as string[] });
  const { toast } = useToast();

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchemaWithConfirm>>({
    resolver: zodResolver(signUpSchemaWithConfirm),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
  });

  const handleSignUp = async (data: z.infer<typeof signUpSchemaWithConfirm>) => {
    const rateLimitKey = `signup_${data.email}`;
    
    if (!authRateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(rateLimitKey) / 1000 / 60);
      toast({
        title: "Muitas tentativas",
        description: `Tente novamente em ${remainingTime} minutos.`,
        variant: "destructive"
      });
      return;
    }

    const sanitizedEmail = sanitizeInput(data.email);
    const sanitizedName = sanitizeInput(data.name || '');

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: sanitizedName
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está cadastrado. Tente fazer login.",
            variant: "destructive"
          });
        } else if (error.message.includes('Password should be')) {
          toast({
            title: "Senha inválida",
            description: "A senha deve ter pelo menos 8 caracteres e conter letras maiúsculas, minúsculas e números.",
            variant: "destructive"
          });
        } else if (error.message.includes('User already registered')) {
          toast({
            title: "Usuário já cadastrado",
            description: "Faça login ou use outro email.",
            variant: "destructive"
          });
        } else if (error.message.includes('Invalid email')) {
          toast({
            title: "Email inválido",
            description: "Verifique o formato do email.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
        signUpForm.reset();
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: z.infer<typeof signInSchema>) => {
    const rateLimitKey = `signin_${data.email}`;
    
    if (!authRateLimiter.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(rateLimitKey) / 1000 / 60);
      toast({
        title: "Muitas tentativas",
        description: `Tente novamente em ${remainingTime} minutos.`,
        variant: "destructive"
      });
      return;
    }

    const sanitizedEmail = sanitizeInput(data.email);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: data.password,
      });

      if (error) {
        if (error.message.includes('Invalid credentials') || error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos.",
            variant: "destructive"
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email não confirmado",
            description: "Verifique sua caixa de entrada.",
            variant: "destructive"
          });
        } else if (error.message.includes('Too many requests')) {
          toast({
            title: "Muitas tentativas",
            description: "Tente novamente mais tarde.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no login",
            description: "Verifique suas credenciais.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
        signInForm.reset();
      }
    } catch (error) {
      console.error('Signin error:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (password: string) => {
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-green-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <Card variant="floating" className="w-full max-w-md backdrop-blur-sm bg-white/90 border border-gray-200 animate-fade-in shadow-xl">
        <CardHeader className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Heart className="h-10 w-10 text-blue-500 animate-pulse-glow" />
              <div className="absolute inset-0 h-10 w-10 text-blue-500/20 animate-ping"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Nós Dois
              </h1>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full mt-2"></div>
            </div>
          </div>
          <CardDescription className="text-center text-base text-gray-600">
            Seu assistente pessoal para finanças, tarefas e agendamentos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 backdrop-blur-sm">
              <TabsTrigger value="signin" className="transition-smooth data-[state=active]:bg-blue-500 data-[state=active]:text-white">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="transition-smooth data-[state=active]:bg-blue-500 data-[state=active]:text-white">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Seu nome"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            disabled={isLoading}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handlePasswordChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {field.value && (
                          <div className="text-xs space-y-1">
                            <div className={`${passwordStrength.isStrong ? 'text-green-600' : 'text-red-600'}`}>
                              Força da senha: {passwordStrength.score}/5
                            </div>
                            {passwordStrength.feedback.length > 0 && (
                              <ul className="text-red-600 list-disc list-inside">
                                {passwordStrength.feedback.map((tip, index) => (
                                  <li key={index}>{tip}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    size="lg"
                    disabled={isLoading || !passwordStrength.isStrong}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Conta
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};