import { promises as fs } from 'fs'
import path from 'path'

/**
 * Load JSON data from the data directory
 * @param filename - Name of the JSON file (e.g., 'content.json')
 * @param fallbackValue - Value to return if file doesn't exist or has errors
 * @returns Parsed JSON data or fallback value
 */
export async function loadJsonData<T = any>(
  filename: string, 
  fallbackValue: T = [] as any
): Promise<T> {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const filePath = path.join(dataDir, filename)
    const fileContent = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContent) as T
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return fallbackValue
  }
}

/**
 * Load JSON data with fallback to empty array if file doesn't exist
 * @param filename - Name of the JSON file
 * @returns Parsed JSON data or empty array
 */
export async function loadJsonDataSafe<T = any>(filename: string): Promise<T[]> {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const filePath = path.join(dataDir, filename)
    const fileContent = await fs.readFile(filePath, 'utf8').catch(() => '[]')
    return JSON.parse(fileContent) as T[]
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

/**
 * Create a standardized getStaticProps function for data loading
 * @param filename - Name of the JSON file to load
 * @param propName - Name of the prop to pass to the page component
 * @returns getStaticProps function
 */
export function createGetStaticProps<T = any>(filename: string, propName: string) {
  return async () => {
    const data = await loadJsonDataSafe<T>(filename)
    return {
      props: {
        [propName]: data
      }
    }
  }
}
