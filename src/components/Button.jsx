function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  className = '',
}) {
  const baseStyles =
    'btn-3d inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'

  // Exemplo de como deve estar dentro de Button.jsx:
// Exemplo de como deve estar dentro de Button.jsx:
const variants = {
  primary: 'bg-green-600 text-white hover:bg-green-700 ...',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 ...',
  // Altere a linha do ghost para incluir um hover visível:
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900',
  // ou verde: 'bg-transparent text-gray-700 hover:bg-green-50 hover:text-green-700'
}

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const width = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button