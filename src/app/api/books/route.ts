import { NextRequest, NextResponse } from 'next/server'
const db = require('@/utils/db')

export async function GET(request: NextRequest) {
  const books = db.getBooks()
  return NextResponse.json(books)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.admin !== 'true') {
      return NextResponse.json({ error: '권한 없음' }, { status: 403 })
    }

    const stock = body.stock !== undefined ? Number(body.stock) : 0;
    const bookId = db.addBook(body.title, body.price, stock)

    const newBook = {
      id: bookId,
      title: body.title,
      price: body.price,
      stock: stock
    }

    return NextResponse.json(newBook)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const Database = require('better-sqlite3')
  const path = require('path')
  const dbPath = path.join(process.cwd(), 'bookstore.db')
  const database = new Database(dbPath)

  const stmt = database.prepare("DELETE FROM books WHERE id = " + id)
  stmt.run()

  database.close()
  return NextResponse.json({ success: true })
}
