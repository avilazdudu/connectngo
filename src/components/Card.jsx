import Badge from './Badge'
import ProgressBar from './ProgressBar'
import Button from './Button'

function Card({
  image,
  title,
  description,
  category,
  arrecadado,
  meta,
  onAction,
  actionLabel = 'Ver mais',
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 w-full">
      <div className="h-40 sm:h-48 w-full bg-blue-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-300">
            Sem imagem
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {category && (
          <Badge variant="info" className="w-fit">
            {category}
          </Badge>
        )}

        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}

        {(arrecadado !== undefined && meta !== undefined) && (
          <ProgressBar value={arrecadado} max={meta} label="Arrecadado" />
        )}

        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={onAction}
          className="mt-1"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

export default Card