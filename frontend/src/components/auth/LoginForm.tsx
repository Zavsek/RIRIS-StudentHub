import { useState, type FormEvent } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((state) => state.login)
  const error = useAuthStore((state) => state.error)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await login({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        label="E-pošta"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="student@uni.si"
        required
      />
      <Input
        label="Geslo"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
        required
      />
      <div className="flex justify-end">
        <a href="#" className="text-sm text-primary hover:underline">
          Ste pozabili geslo?
        </a>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" fullWidth className="mt-2" disabled={isSubmitting}>
        {isSubmitting ? 'Prijava...' : 'Prijava'}
      </Button>
    </form>
  )
}
