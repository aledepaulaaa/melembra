// appbora/src/app/lib/resizeImageToStorage.ts
import imageCompression from 'browser-image-compression'

// Opções de compressão para um bom equilíbrio entre qualidade e tamanho
const compressionOptions = {
    maxSizeMB: 0.5, // Tamanho máximo de 500KB
    maxWidthOrHeight: 800, // Redimensiona para no máximo 800px de largura ou altura
    useWebWorker: true, // Usa um web worker para não travar a UI principal
    fileType: 'image/png' // Força a conversão para PNG
}

/**
 * Comprime uma imagem no navegador antes do upload.
 * @param {File} imageFile - O arquivo de imagem original do input.
 * @returns {Promise<File>} - Uma promise que resolve para o arquivo de imagem comprimido.
 */
export async function resizeImageToStorage(imageFile: File): Promise<File> {
    // console.log(`Tamanho original da imagem: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`)
    try {
        const compressedFile = await imageCompression(imageFile, compressionOptions)
        // console.log(`Tamanho da imagem comprimida: ${(compressedFile.size / 1024).toFixed(2)} KB`)
        // O tipo já é definido nas opções, mas podemos criar um novo arquivo se precisarmos renomear
        return new File([compressedFile], "lembrete_personalizado.png", { type: 'image/png' })
    } catch (error) {
        console.error('Erro ao comprimir a imagem:', error)
        throw error // Propaga o erro para ser tratado no handler
    }
}