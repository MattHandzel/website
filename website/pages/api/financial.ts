import { NextApiRequest, NextApiResponse } from 'next'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

const dbPath = path.join(process.cwd(), '..', 'database', 'website.db')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const db = new sqlite3.Database(dbPath)
    const all = promisify(db.all.bind(db))

    const financial = await all('SELECT * FROM financial_data ORDER BY month DESC')
    
    db.close()
    
    res.status(200).json(financial)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
