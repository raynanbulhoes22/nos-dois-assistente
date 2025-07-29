import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { Heart } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold mb-2">Nós Dois</h1>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <Dashboard user={user} />;
};

export default Index;
