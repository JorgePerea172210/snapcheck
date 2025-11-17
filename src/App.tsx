import React, { useState } from 'react';
import { Camera, Download, ArrowRight, Loader2 } from 'lucide-react';

interface ImageData {
    link: string;
    classifications: string[];
}

type Classification = 'Borrosa ligeramente' | 'Mal recortada' | 'Mal empalmada';

const App: React.FC = () => {
    const [imageLink, setImageLink] = useState('');
    const [currentImage, setCurrentImage] = useState('');
    const [selectedClassifications, setSelectedClassifications] = useState<Set<Classification>>(new Set());
    const [imageDataList, setImageDataList] = useState<ImageData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const classifications: Classification[] = [
        'Borrosa ligeramente',
        'Mal recortada',
        'Mal empalmada'
    ];

    const classificationColors: Record<Classification, { bg: string; hover: string; active: string }> = {
        'Borrosa ligeramente': {
            bg: 'bg-red-500',
            hover: 'hover:bg-red-600',
            active: 'ring-4 ring-red-300 scale-105'
        },
        'Mal recortada': {
            bg: 'bg-orange-500',
            hover: 'hover:bg-orange-600',
            active: 'ring-4 ring-orange-300 scale-105'
        },
        'Mal empalmada': {
            bg: 'bg-gray-700',
            hover: 'hover:bg-gray-800',
            active: 'ring-4 ring-gray-400 scale-105'
        }
    };

    const handleLoadImage = () => {
        if (!imageLink.trim()) return;

        setIsLoading(true);
        setLoadError(false);

        const img = new Image();
        img.onload = () => {
            setCurrentImage(imageLink);
            setIsLoading(false);
        };
        img.onerror = () => {
            setLoadError(true);
            setIsLoading(false);
        };
        img.src = imageLink;
    };

    const toggleClassification = (classification: Classification) => {
        const newSelected = new Set(selectedClassifications);
        if (newSelected.has(classification)) {
            newSelected.delete(classification);
        } else {
            newSelected.add(classification);
        }
        setSelectedClassifications(newSelected);
    };

    const handleNext = () => {
        if (!currentImage) {
            alert('Por favor, carga una imagen primero');
            return;
        }

        const newData: ImageData = {
            link: currentImage,
            classifications: Array.from(selectedClassifications)
        };

        setImageDataList([...imageDataList, newData]);

        // Limpiar campos
        setImageLink('');
        setCurrentImage('');
        setSelectedClassifications(new Set());
        setLoadError(false);
    };

    const handleExportExcel = () => {
        if (imageDataList.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Crear CSV
        let csvContent = 'Link,Clasificación\n';

        imageDataList.forEach(data => {
            const classifications = data.classifications.length > 0
                ? data.classifications.join('; ')
                : 'Sin clasificación';
            csvContent += `"${data.link}","${classifications}"\n`;
        });

        // Descargar CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `snapcheck_validacion_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900">
            {/* Header */}
            <header className="bg-red-950 shadow-2xl border-b border-red-700">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-3">
                        <Camera className="w-10 h-10 text-red-300" />
                        <h1 className="text-4xl font-bold text-white tracking-tight">SnapCheck</h1>
                    </div>
                    <p className="text-red-200 mt-2 text-sm">Sistema de Validación de Fotos Publicitarias</p>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Pegar Links */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 transform transition-all hover:scale-[1.02]">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-2 h-8 bg-red-400 rounded-full"></div>
                            Pegar Links
                        </h2>

                        <div className="space-y-4">
              <textarea
                  value={imageLink}
                  onChange={(e) => setImageLink(e.target.value)}
                  placeholder="Pega aquí el link de la imagen..."
                  className="w-full h-40 bg-white/90 rounded-xl p-4 text-gray-800 text-sm font-mono resize-none focus:ring-4 focus:ring-red-400 focus:outline-none transition-all shadow-inner"
              />

                            <button
                                onClick={handleLoadImage}
                                disabled={isLoading || !imageLink.trim()}
                                className="w-full bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Cargando...
                                    </>
                                ) : (
                                    'Cargar Imagen'
                                )}
                            </button>

                            {imageDataList.length > 0 && (
                                <div className="bg-white/20 rounded-lg p-3 text-white text-sm">
                                    <p className="font-semibold">Imágenes procesadas: {imageDataList.length}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Imagen Seleccionada */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 transform transition-all hover:scale-[1.02]">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-2 h-8 bg-blue-400 rounded-full"></div>
                            Imagen Seleccionada
                        </h2>

                        <div className="bg-white/90 rounded-xl p-4 min-h-[400px] flex items-center justify-center shadow-inner">
                            {loadError ? (
                                <div className="text-center text-red-600">
                                    <p className="font-semibold">Error al cargar la imagen</p>
                                    <p className="text-sm">Verifica el link e intenta nuevamente</p>
                                </div>
                            ) : currentImage ? (
                                <img
                                    src={currentImage}
                                    alt="Imagen publicitaria"
                                    className="max-w-full max-h-[400px] object-contain rounded-lg shadow-xl animate-fade-in"
                                />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Camera className="w-16 h-16 mx-auto mb-3 opacity-50" />
                                    <p>No hay imagen cargada</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clasificaciones */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 transform transition-all hover:scale-[1.02]">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-2 h-8 bg-green-400 rounded-full"></div>
                            Clasificaciones
                        </h2>

                        <div className="space-y-4">
                            {classifications.map((classification) => (
                                <button
                                    key={classification}
                                    onClick={() => toggleClassification(classification)}
                                    className={`
                    w-full ${classificationColors[classification].bg} 
                    ${classificationColors[classification].hover}
                    ${selectedClassifications.has(classification) ? classificationColors[classification].active : ''}
                    text-white font-bold py-5 rounded-xl shadow-lg 
                    transform transition-all duration-200
                    hover:scale-105 active:scale-95
                    ${selectedClassifications.has(classification) ? 'shadow-2xl' : ''}
                  `}
                                >
                  <span className="flex items-center justify-center gap-2">
                    {selectedClassifications.has(classification) && (
                        <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-lg">✓</span>
                      </span>
                    )}
                      {classification}
                  </span>
                                </button>
                            ))}

                            {selectedClassifications.size > 0 && (
                                <div className="bg-white/20 rounded-lg p-3 text-white text-sm animate-fade-in">
                                    <p className="font-semibold mb-1">Clasificaciones seleccionadas:</p>
                                    <p>{Array.from(selectedClassifications).join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4 justify-center">
                    <button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        Siguiente
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleExportExcel}
                        disabled={imageDataList.length === 0}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Exportar Excel
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default App;