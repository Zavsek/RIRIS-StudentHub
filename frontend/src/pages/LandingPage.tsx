import { useState } from 'react'
import { BookOpen, Calendar, Users } from 'lucide-react'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'
import logoUrl from '../assets/Logo.png'

export const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const clearError = useAuthStore((state) => state.clearError)

  const showLogin = () => {
    clearError()
    setIsLogin(true)
  }

  const showRegister = () => {
    clearError()
    setIsLogin(false)
  }

  return (
    <div className="min-h-dvh md:h-dvh md:overflow-hidden bg-background flex flex-col md:flex-row">
      {/* Levi del - Informacije in Hero */}
      <div className="w-full md:w-5/12 flex flex-col bg-surface">
        <div className="bg-primary border-b-4 border-secondary px-8 py-8 md:px-12 md:py-10">
          <div className="max-w-lg mx-auto flex flex-wrap items-center gap-x-8 gap-y-4">
            <img src={logoUrl} alt="StudentHub Logo" className="w-24 h-24 shrink-0 object-contain" />
            <h1 className="text-5xl font-bold tracking-tight text-white">Student <span className="text-secondary">Hub</span></h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 py-8 md:px-12">
          <div className="max-w-lg mx-auto">
            <p className="text-lg mb-8 text-text-muted leading-relaxed">
              Vaše osrednje mesto za študij. Združujemo ključna študijska orodja, zanesljiva gradiva in pomembne obveznosti na enem preglednem mestu.
            </p>

            <div className="space-y-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-primary-soft flex items-center justify-center text-primary">
                  <BookOpen size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Dostop do gradiv</h3>
                  <p className="text-text-muted">Brskajte po zanesljivih gradivih, delite svoje skripte in sodelujte v predmetnih razpravah.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-secondary-soft flex items-center justify-center text-secondary">
                  <Calendar size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Spremljanje obveznosti</h3>
                  <p className="text-text-muted">Nikoli več ne zamudite roka. Pregleden koledar s kolokviji, izpiti in oddajami nalog.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-primary-soft flex items-center justify-center text-primary">
                  <Users size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Sodelovanje in projekti</h3>
                  <p className="text-text-muted">Enostavno usklajevanje prostega časa s kolegi za učinkovitejše skupinsko delo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desni del - Prijava in Registracija */}
      <div className="w-full md:w-7/12 px-6 flex items-center justify-center bg-background">
        <div className="w-full max-w-md bg-surface p-8 shadow-sm border border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-text-main">
              {user ? 'Račun je aktiven' : isLogin ? 'Dobrodošli nazaj' : 'Ustvarite račun'}
            </h2>
            <p className="text-text-muted mt-2 font-medium">
              {user
                ? 'Odjava prekliče osvežitveni žeton.'
                : isLogin
                  ? 'Vnesite svoje podatke za dostop do profila.'
                  : 'Pridružite se skupnosti uspešnih študentov.'}
            </p>
          </div>

          {user ? (
            <div className="flex flex-col gap-4">
              <p className="text-text-main">
                Prijavljen si kot <span className="font-semibold">{user.name}</span>.
              </p>
              <Button type="button" fullWidth onClick={() => logout()}>
                Odjava
              </Button>
            </div>
          ) : (
            <>
              {isLogin ? <LoginForm /> : <RegisterForm />}
              <div className="mt-6 pt-4 border-t border-border text-center text-text-muted">
                {isLogin ? (
                  <p>
                    Še nimate računa?{' '}
                    <button
                      type="button"
                      onClick={showRegister}
                      className="text-secondary font-semibold hover:underline transition-colors"
                    >
                      Registrirajte se
                    </button>
                  </p>
                ) : (
                  <p>
                    Že imate račun?{' '}
                    <button
                      type="button"
                      onClick={showLogin}
                      className="text-secondary font-semibold hover:underline transition-colors"
                    >
                      Prijavite se
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
