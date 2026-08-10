import { useState, useEffect } from 'react'
import { slugify } from '../utils/slug'
import { getFileListUrl, getImageUrl } from '../config/apiConfig'

export function useTempleImages(stateName, townName, templeName) {
  const [images, setImages] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadImages() {
      try {
        setStatus('loading')
        setError(null)

        // Convert to folder path format
        const stateFolder = slugify(stateName)
        const townFolder = slugify(townName)
        const templeFolder = slugify(templeName)
        const folderPath = `temples/${stateFolder}/${townFolder}/${templeFolder}`

        // Fetch file list
        const fileListUrl = getFileListUrl(folderPath)

        console.log('Debug Info:', {
          stateName,
          townName,
          templeName,
          stateFolder,
          townFolder,
          templeFolder,
          folderPath,
          fileListUrl,
        })

        setDebugInfo({
          stateName,
          townName,
          templeName,
          stateFolder,
          townFolder,
          templeFolder,
          folderPath,
          fileListUrl,
        })

        const response = await fetch(fileListUrl)

        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }

        const data = await response.json()

        if (!data.files || data.files.length === 0) {
          setImages([])
          setStatus('ready')
          return
        }

        // Separate images from other files
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        const imageFiles = data.files.filter((file) => {
          const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
          return imageExtensions.includes(ext)
        })

        // Find description files
        const descriptionFiles = data.files.filter(
          (file) =>
            file.name.toLowerCase().endsWith('.md') ||
            file.name.toLowerCase().endsWith('.txt')
        )

        // Create image objects with descriptions
        const imagesWithDescriptions = await Promise.all(
          imageFiles.map(async (imageFile) => {
            const imageName = imageFile.name.slice(0, imageFile.name.lastIndexOf('.'))

            // Look for image-specific description
            let description = null
            const specificDescFile = descriptionFiles.find(
              (f) =>
                f.name.toLowerCase() ===
                `${imageName}.md`.toLowerCase() ||
                f.name.toLowerCase() === `${imageName}.txt`.toLowerCase()
            )

            if (specificDescFile) {
              description = await fetchFileContent(
                folderPath,
                specificDescFile.path
              )
            } else {
              // Fall back to general description.md
              const generalDesc = descriptionFiles.find(
                (f) =>
                  f.name.toLowerCase() === 'description.md' ||
                  f.name.toLowerCase() === 'description.txt'
              )
              if (generalDesc) {
                description = await fetchFileContent(folderPath, generalDesc.path)
              }
            }

            return {
              name: imageFile.name,
              path: imageFile.path,
              fullUrl: getImageUrl(folderPath, imageFile.path),
              description,
              size: imageFile.size,
              modified: imageFile.modified,
            }
          })
        )

        if (isMounted) {
          setImages(imagesWithDescriptions)
          setStatus('ready')
        }
      } catch (err) {
        console.error('Error loading images:', err)
        if (isMounted) {
          setError(err.message)
          setStatus('ready') // Set to ready even on error to show error message
        }
      }
    }

    if (stateName && townName && templeName) {
      loadImages()
    }

    return () => {
      isMounted = false
    }
  }, [stateName, townName, templeName])

  return { images, status, error, debugInfo }
}

async function fetchFileContent(folderPath, filePath) {
  try {
    const url = getImageUrl(folderPath, filePath)
    const response = await fetch(url)
    if (response.ok) {
      return await response.text()
    }
    return null
  } catch (err) {
    console.error('Error fetching file:', err)
    return null
  }
}
