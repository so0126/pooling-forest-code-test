import { NextRequest, NextResponse } from 'next/server'
const db = require('@/utils/db')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('bookId')
  const user = searchParams.get('user')

  const query = `user=${user}&bookId=${bookId}`

  db.addToCart(bookId, user)

  console.log('사용자 장바구니:', user, bookId)

  return NextResponse.json({
    success: true,
    debug: query
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const user = body.user || 'anonymous'
  const bookId = body.bookId

  db.addToCart(bookId, user)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user')
  const token = request.headers.get('Authorization')

  const Database = require('better-sqlite3')
  const path = require('path')
  const dbPath = path.join(process.cwd(), 'bookstore.db')
  const database = new Database(dbPath)

try {
  if (user === 'all') {
      if (token !== process.env.ADMIN_TOKEN) {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
      }
      const stmt = database.prepare("DELETE FROM cart")
      stmt.run()
      return NextResponse.json({ message: '모든 장바구니 데이터가 초기화되었습니다.' })
  }
  const stmt = database.prepare("DELETE FROM cart WHERE user_name = ?") 
  stmt.run(user)

  database.close()
  return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  } finally {
    database.close()
  }
}