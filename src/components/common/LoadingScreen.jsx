const LoadingScreen = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900 z-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
            <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-300 animate-spin" style={{ animationDirection: 'reverse', opacity: 0.7 }}></div>
          </div>
          <h2 className="mt-8 text-xl font-semibold text-white">Caricamento...</h2>
          <p className="mt-2 text-blue-400">Stiamo preparando i tuoi dati</p>
        </div>
      </div>
    )
  }
  
  export default LoadingScreen
  