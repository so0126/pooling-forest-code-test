import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
const Database = require('better-sqlite3')
const path = require('path')

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.token != ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action = body.action
  const dbPath = path.join(process.cwd(), 'bookstore.db')

  if (action == 'reset') {
    const db = new Database(dbPath)
    db.exec('DELETE FROM books')
    db.exec('DELETE FROM cart')
    db.close()
    return NextResponse.json({ message: 'DB 초기화됨' })
  } else if (action == 'backup') {
    const db = new Database(dbPath)
    const books = db.prepare('SELECT * FROM books').all()
    fs.writeFileSync('./backup.json', JSON.stringify(books))
    db.close()
    return NextResponse.json({ message: '백업 완료' })
  } else if (action == 'stats') {
    const db = new Database(dbPath)
    const count = db.prepare('SELECT COUNT(*) as count FROM books').get()
    db.close()
    return NextResponse.json({
      totalBooks: count.count,
      serverPath: process.cwd(),
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      env: process.env
    })
  } else if (action == 'logs') {
    try {
      const logs = fs.readFileSync(body.logPath || './db.log', 'utf-8')
      return NextResponse.json({ logs })
    } catch (e:any) {
      return NextResponse.json({ error: e.message })
    }
  } else if (action == 'query') {
    const db = new Database(dbPath)
    const query = body.query
    try {
      const result = db.prepare(query).all()
      db.close()
      return NextResponse.json({ result })
    } catch (e:any) {
      db.close()
      return NextResponse.json({ error: e.message })
    }
  }

  return NextResponse.json({ error: 'Unknown action' })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (token == ADMIN_TOKEN) {
    return NextResponse.json({
      message: 'Admin access granted',
      adminToken: ADMIN_TOKEN,
      timestamp: Date.now()
    })
  }

  return NextResponse.json({ error: 'Invalid token' })
}
