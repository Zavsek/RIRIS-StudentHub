import { useState, type FormEvent } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export const RegisterForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mismatch, setMismatch] = useState('')
  const register = useAuthStore((state) => state.register)
  const error = useAuthStore((state) => state.error)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setMismatch('Gesli se ne ujemata.')
      return
    }

    setMismatch('')
    await register({ name, email, password })
  }

  const message = mismatch || error

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        label="Ime in priimek"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Janez Novak"
        required
      />
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
      <Input
        label="Potrdi geslo"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="••••••••"
        required
      />
      {message && <p className="text-sm text-danger">{message}</p>}
      <Button type="submit" fullWidth className="mt-2" disabled={isSubmitting}>
        {isSubmitting ? 'Registracija...' : 'Registracija'}
      </Button>
    </form>
  )
}
