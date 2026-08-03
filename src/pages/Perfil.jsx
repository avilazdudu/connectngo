import { useParams } from 'react-router-dom'

function Perfil() {
  const { id } = useParams()

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Perfil do usuário {id}</h1>
    </div>
  )
}

export default Perfil