const PageHeader = ({ title, description }) => {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {description && (
          <p className="mt-2 text-blue-300">{description}</p>
        )}
        <div className="mt-4 h-1 w-20 bg-blue-500 rounded"></div>
      </div>
    )
  }
  
  export default PageHeader
  