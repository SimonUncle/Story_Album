// 이미지 압축 유틸리티

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options

  // 이미지가 아니면 그대로 반환
  if (!file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // 원본 크기 계산
      let { width, height } = img

      // 리사이즈가 필요한지 확인
      if (width <= maxWidth && height <= maxHeight && file.size < 1024 * 1024) {
        // 1MB 이하이고 크기도 작으면 그대로
        URL.revokeObjectURL(img.src)
        resolve(file)
        return
      }

      // 비율 유지하면서 리사이즈
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Canvas로 압축
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(img.src)
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(img.src)
          if (!blob) {
            resolve(file)
            return
          }

          // 압축된 파일 생성
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })

          console.log(
            `이미지 압축: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
          )

          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('이미지 로드 실패'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// 여러 이미지 일괄 압축
export async function compressImages(
  files: File[],
  options?: CompressOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)))
}
