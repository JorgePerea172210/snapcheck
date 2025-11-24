import { useState } from 'react';
import { Camera, Download, Image as ImageIcon } from 'lucide-react';

interface ImageData {
    id: string;
    link: string;
    classifications: string[];
}

const classifications = [
    { id: 'borrosa', label: 'Borrosa ligeramente', color: 'bg-red-500 hover:bg-red-600' },
    { id: 'mal-recortada', label: 'Mal recortada', color: 'bg-orange-500 hover:bg-orange-600' },
    { id: 'mal-empalmada', label: 'Mal empalmada', color: 'bg-gray-700 hover:bg-gray-800' }
];

function ImageCard({ imageData, onToggleClassification }: {
    imageData: ImageData;
    onToggleClassification: (imageId: string, classificationId: string) => void;
}) {
    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20 transition-all hover:shadow-red-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Imagen */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Imagen Seleccionada
                    </h3>
                    <div className="bg-white/20 rounded-lg p-3 h-64 flex items-center justify-center overflow-hidden">
                        <img
                            src={imageData.link}
                            alt="Imagen"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '';
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<p class="text-white/50 text-center text-sm">Error al cargar imagen</p>';
                            }}
                        />
                    </div>
                    <p className="text-white/70 text-xs mt-2 break-all line-clamp-2" title={imageData.link}>
                        {imageData.link}
                    </p>
                </div>

                {/* Clasificaciones */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">Clasificaciones</h3>
                    <div className="space-y-3">
                        {classifications.map((classification) => {
                            const isSelected = imageData.classifications.includes(classification.id);
                            return (
                                <button
                                    key={classification.id}
                                    onClick={() => onToggleClassification(imageData.id, classification.id)}
                                    className={`w-full ${classification.color} text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                                        isSelected
                                            ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-red-900 scale-105'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">{classification.label}</span>
                                        {isSelected && (
                                            <span className="text-xl animate-bounce">✓</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SnapCheck() {
    const [imageLinks, setImageLinks] = useState('');
    const [loadedImages, setLoadedImages] = useState<ImageData[]>([]);

    const handleLoadImages = () => {
        const links = imageLinks
            .split('\n')
            .map(link => link.trim())
            .filter(link => link.length > 0);

        if (links.length === 0) {
            alert('Por favor ingresa al menos un link de imagen');
            return;
        }

        const newImages: ImageData[] = links.map((link, index) => ({
            id: `img-${Date.now()}-${index}`,
            link,
            classifications: []
        }));

        setLoadedImages(newImages);
        setImageLinks('');
    };

    const handleToggleClassification = (imageId: string, classificationId: string) => {
        setLoadedImages(prev =>
            prev.map(img =>
                img.id === imageId
                    ? {
                        ...img,
                        classifications: img.classifications.includes(classificationId)
                            ? img.classifications.filter(c => c !== classificationId)
                            : [...img.classifications, classificationId]
                    }
                    : img
            )
        );
    };

    const handleExportExcel = () => {
        if (loadedImages.length === 0) {
            alert('No hay imágenes cargadas para exportar');
            return;
        }

        // Crear CSV
        let csv = 'Link,Clasificación\n';

        loadedImages.forEach(imageData => {
            const classificationsText = imageData.classifications.length > 0
                ? imageData.classifications
                    .map(id => classifications.find(c => c.id === id)?.label || id)
                    .join('; ')
                : 'Sin clasificación';
            csv += `"${imageData.link}","${classificationsText}"\n`;
        });

        // Descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `snapcheck_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Camera className="w-10 h-10 text-white" />
                    <h1 className="text-5xl font-bold text-white tracking-tight">SnapCheck</h1>
                </div>
            </div>

            {/* Input Section */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-4">Pegar Links</h2>
                    <textarea
                        value={imageLinks}
                        onChange={(e) => setImageLinks(e.target.value)}
                        className="w-full h-32 bg-white/90 rounded-lg p-4 text-gray-800 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                        placeholder="Pega los links de las imágenes aquí (uno por línea)..."
                    />
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={handleLoadImages}
                            className="flex-1 bg-red-400 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            Cargar Imágenes
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={loadedImages.length === 0}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Exportar Excel ({loadedImages.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Images Grid */}
            {loadedImages.length > 0 && (
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Imágenes Cargadas ({loadedImages.length})
                    </h2>
                    <div className="space-y-4">
                        {loadedImages.map((imageData) => (
                            <ImageCard
                                key={imageData.id}
                                imageData={imageData}
                                onToggleClassification={handleToggleClassification}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {loadedImages.length === 0 && (
                <div className="max-w-7xl mx-auto text-center py-16">
                    <Camera className="w-24 h-24 text-white/30 mx-auto mb-4" />
                    <p className="text-white/50 text-xl">
                        No hay imágenes cargadas. Pega los links arriba y presiona "Cargar Imágenes"
                    </p>
                </div>
            )}

            {/* CSS personalizado para animaciones */}
            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
}