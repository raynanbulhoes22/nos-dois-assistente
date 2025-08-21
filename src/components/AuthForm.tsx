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
import { Checkbox } from "@/components/ui/checkbox";
import { authSchema, type AuthFormData } from '@/lib/validations';
import { sanitizeInput, authRateLimiter, checkPasswordStrength } from '@/lib/security';
import { PhoneInput } from '@/components/ui/phone-input';
import { logger } from '@/lib/production-logger';

const signInSchema = authSchema.omit({ name: true });
const signUpSchemaWithConfirm = authSchema.extend({
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  whatsapp: z
    .string()
    .min(1, 'WhatsApp é obrigatório')
    .regex(/^55\d{10,11}$/, 'WhatsApp deve estar no formato brasileiro (11 ou 12 dígitos com código do país)')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ isStrong: false, score: 0, feedback: [] as string[] });
  const [rememberMe, setRememberMe] = useState(false);
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
      whatsapp: '',
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
    const sanitizedWhatsapp = sanitizeInput(data.whatsapp || '');

    setIsLoading(true);
    logger.info('Iniciando processo de cadastro');

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: signUpResult, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: sanitizedName,
            numero_wpp: sanitizedWhatsapp
          }
        }
      });

      if (error) {
        logger.error('Erro no processo de cadastro', error);
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          // Usuário já existe, mostrar tela de confirmação mesmo assim
          logger.warn('Tentativa de cadastro com email já registrado');
          setRegisteredEmail(sanitizedEmail);
          setShowEmailConfirmation(true);
          toast({
            title: "Email já cadastrado",
            description: "Este email já está registrado. Verifique sua caixa de entrada para confirmar seu email ou tente fazer login se já confirmou.",
            variant: "default"
          });
        } else if (error.message.includes('Password should be')) {
          toast({
            title: "Senha inválida",
            description: "A senha deve ter pelo menos 8 caracteres e conter letras maiúsculas, minúsculas e números.",
            variant: "destructive"
          });
        } else if (error.message.includes('Invalid email')) {
          toast({
            title: "Email inválido",
            description: "Verifique o formato do email.",
            variant: "destructive"
          });
        } else if (error.message.includes('Signup disabled')) {
          toast({
            title: "Cadastro temporariamente indisponível",
            description: "Tente novamente em alguns minutos ou entre em contato conosco.",
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
        logger.info('Cadastro realizado com sucesso');
        // Cadastro realizado com sucesso
        setRegisteredEmail(sanitizedEmail);
        setShowEmailConfirmation(true);
        
        // Verificar se precisa confirmar email
        if (!signUpResult.session && signUpResult.user) {
          logger.info('Email de confirmação enviado');
          toast({
            title: "Cadastro realizado com sucesso! 🎉",
            description: "Verifique sua caixa de entrada para confirmar seu email.",
          });
        } else if (signUpResult.session) {
          logger.info('Login automático realizado após cadastro');
          toast({
            title: "Cadastro e login realizados! 🎉",
            description: "Bem-vindo ao Lyvo | LucraAI!",
          });
          // Se já logou automaticamente, não precisamos da tela de confirmação
          setShowEmailConfirmation(false);
        }
        
        signUpForm.reset();
      }
    } catch (error) {
      logger.error('Erro inesperado durante cadastro', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithRetry = async (data: z.infer<typeof signInSchema>, retryCount = 0) => {
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
      const { data: session, error } = await supabase.auth.signInWithPassword({
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
            description: "Verifique sua caixa de entrada e confirme seu email antes de fazer login.",
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
    } catch (error: any) {
      logger.error('Erro durante login', error);
      
      // Check for network-related errors
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        if (retryCount < 2) {
          // Retry after a short delay
          setTimeout(() => {
            handleSignInWithRetry(data, retryCount + 1);
          }, 1000 * (retryCount + 1));
          
          toast({
            title: "Problema de conexão",
            description: `Tentando novamente... (${retryCount + 1}/3)`,
            variant: "default"
          });
          return;
        } else {
          toast({
            title: "Erro de conexão",
            description: "Verifique sua conexão com a internet e tente novamente.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Erro inesperado",
          description: "Tente novamente mais tarde.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: z.infer<typeof signInSchema>) => {
    await handleSignInWithRetry(data, 0);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Erro no login com Google",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error('Erro durante login com Google', error);
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

  const handleForgotPassword = async (email: string) => {
    const sanitizedEmail = sanitizeInput(email);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
        setShowForgotPassword(false);
      }
    } catch (error) {
      logger.error('Erro durante reset de senha', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Mobile-optimized animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="flex-shrink-0 pt-safe-top px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center pt-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-pulse" />
                <div className="absolute inset-0 h-8 w-8 sm:h-10 sm:w-10 text-primary/20 animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Lyvo | LucraAI
                </h1>
                <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary rounded-full mt-1"></div>
              </div>
            </div>
            <p className="text-center text-sm sm:text-base text-muted-foreground max-w-sm">
              Seu assistente pessoal para finanças, tarefas e agendamentos
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-start justify-center px-4 sm:px-6 pb-safe-bottom">
          <Card className="w-full max-w-sm sm:max-w-md bg-card/95 backdrop-blur-sm border-border/60 shadow-lg animate-fade-in">
            <CardContent className="p-4 sm:p-6">
              {showForgotPassword ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Esqueci minha senha
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Digite seu email para receber as instruções de redefinição
                    </p>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get('email') as string;
                    if (email) {
                      handleForgotPassword(email);
                    }
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="forgot-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        disabled={isLoading}
                        className="h-12 text-base"
                      />
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Enviar instruções"
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Voltar para o login
                      </Button>
                    </div>
                  </form>
                </div>
              ) : showEmailConfirmation ? (
                <div className="text-center space-y-6 py-4">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-primary-foreground text-xs font-bold">!</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">
                      Verifique seu email
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Enviamos um email de confirmação para:
                    </p>
                    <p className="font-medium text-primary bg-muted py-2 px-3 rounded-lg text-sm">
                      {registeredEmail}
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-left">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs text-yellow-700">
                            <strong>Importante:</strong> O email será enviado em nome do <strong>Supabase</strong>. 
                            Verifique também sua pasta de spam.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowEmailConfirmation(false)}
                      variant="outline"
                      className="w-full h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Voltar para o login
                    </Button>
                    
                    <Button
                      onClick={() => {
                        // Tentar reenviar email de confirmação
                        supabase.auth.resend({
                          type: 'signup',
                          email: registeredEmail,
                          options: {
                            emailRedirectTo: `${window.location.origin}/`
                          }
                        }).then(({ error }) => {
                          if (error) {
                            toast({
                              title: "Erro ao reenviar email",
                              description: "Tente novamente em alguns minutos.",
                              variant: "destructive"
                            });
                          } else {
                            toast({
                              title: "Email reenviado!",
                              description: "Verifique sua caixa de entrada.",
                            });
                          }
                        });
                      }}
                      variant="default"
                      className="w-full h-12 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary-dark"
                    >
                      Reenviar email de confirmação
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      Não recebeu o email? Verifique sua caixa de spam ou tente novamente em alguns minutos.
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
                    <TabsTrigger value="signin" className="h-10 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="h-10 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="mt-6">
                    <Form {...signInForm}>
                      <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                        <FormField
                          control={signInForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="seu@email.com"
                                  disabled={isLoading}
                                  className="h-12 text-base"
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
                              <FormLabel className="text-sm font-medium">Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  disabled={isLoading}
                                  className="h-12 text-base"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Mobile-optimized checkbox and forgot password */}
                        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="rememberMe" 
                              checked={rememberMe}
                              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                              disabled={isLoading}
                            />
                            <Label 
                              htmlFor="rememberMe" 
                              className="text-sm font-medium cursor-pointer"
                            >
                              Mantenha-me conectado
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="link"
                            className="text-sm text-primary hover:text-primary/80 p-0 h-auto font-medium underline-offset-4 hover:underline self-start sm:self-center"
                            onClick={() => setShowForgotPassword(true)}
                            disabled={isLoading}
                          >
                            Esqueci minha senha
                          </Button>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary/90"
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isLoading ? "Entrando..." : "Entrar"}
                        </Button>
                        
                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">ou</span>
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 text-base border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={handleGoogleSignIn}
                          disabled={isLoading}
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continuar com Google
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="mt-6">
                    <Form {...signUpForm}>
                      <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                        <FormField
                          control={signUpForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Nome</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Seu nome"
                                  disabled={isLoading}
                                  className="h-12 text-base"
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
                              <FormLabel className="text-sm font-medium">Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="seu@email.com"
                                  disabled={isLoading}
                                  className="h-12 text-base"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signUpForm.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1 text-sm font-medium">
                                WhatsApp
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <PhoneInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="(11) 9999-9999"
                                  disabled={isLoading}
                                  className="h-12"
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
                              <FormLabel className="text-sm font-medium">Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  disabled={isLoading}
                                  className="h-12 text-base"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handlePasswordChange(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                              {field.value && (
                                <div className="text-xs space-y-1 mt-2">
                                  <div className={`font-medium ${passwordStrength.isStrong ? 'text-green-600' : 'text-red-600'}`}>
                                    Força da senha: {passwordStrength.score}/5
                                  </div>
                                  {passwordStrength.feedback.length > 0 && (
                                    <ul className="text-red-600 space-y-1">
                                      {passwordStrength.feedback.map((tip, index) => (
                                        <li key={index} className="flex items-start gap-1">
                                          <span className="text-xs">•</span>
                                          <span>{tip}</span>
                                        </li>
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
                              <FormLabel className="text-sm font-medium">Confirmar Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  disabled={isLoading}
                                  className="h-12 text-base"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base font-medium bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary-dark"
                          disabled={isLoading || !passwordStrength.isStrong}
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isLoading ? "Criando conta..." : "Criar conta"}
                        </Button>
                        
                        {!passwordStrength.isStrong && signUpForm.watch('password') && (
                          <p className="text-xs text-amber-600 text-center bg-amber-50 p-2 rounded-lg">
                            ⚠️ Fortaleça sua senha para continuar
                          </p>
                        )}
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};