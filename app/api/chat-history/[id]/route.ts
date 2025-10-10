import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const chatHistory = await prisma.chatHistory.findFirst({
      where: {
        id: params.id,
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

    if (!chatHistory) {
      return NextResponse.json(
        { error: 'Chat history not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ chatHistory })
  } catch (error) {
    console.error('Get chat history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, messages } = await request.json()

    const chatHistory = await prisma.chatHistory.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!chatHistory) {
      return NextResponse.json(
        { error: 'Chat history not found' },
        { status: 404 }
      )
    }

    const updatedChatHistory = await prisma.chatHistory.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(messages && { messages })
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
      message: 'Chat history updated successfully',
      chatHistory: updatedChatHistory
    })
  } catch (error) {
    console.error('Update chat history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const chatHistory = await prisma.chatHistory.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!chatHistory) {
      return NextResponse.json(
        { error: 'Chat history not found' },
        { status: 404 }
      )
    }

    await prisma.chatHistory.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Chat history deleted successfully'
    })
  } catch (error) {
    console.error('Delete chat history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

