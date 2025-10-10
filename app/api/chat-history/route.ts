import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/middleware'


export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const chatHistories = await prisma.chatHistory.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        messages: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ chatHistories })
  } catch (error) {
    console.error('Get chat histories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, messages } = await request.json()

    if (!title || !messages) {
      return NextResponse.json(
        { error: 'Title and messages are required' },
        { status: 400 }
      )
    }

    const chatHistory = await prisma.chatHistory.create({
      data: {
        title,
        messages,
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        messages: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Chat history saved successfully',
      chatHistory
    })
  } catch (error) {
    console.error('Save chat history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

