import Card, { CardBody } from './Card'

const InfoCard = ({ title, descriptionValue, descriptionName, icon: Icon }) => {
  return (
    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20 hover:shadow-lg">
      <CardBody>
        <div className="flex items-start">
          {Icon && (
            <div className="flex-shrink-0 mr-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Icon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            {descriptionName && (
              <p className="text-sm font-medium text-blue-300">{descriptionName}</p>
            )}
            <p className="text-blue-100">{descriptionValue}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default InfoCard
