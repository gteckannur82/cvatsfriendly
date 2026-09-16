import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '~/server/env'
import { getSessionUser } from '~/server/auth'
import { newId } from '~/server/crypto'

/** Open to logged-out senders — the contact page is public. */
export const submitEnquiry = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(1, 'Tell us your name.').max(100),
      email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(200),
      subject: z.string().trim().min(1, 'Add a short subject.').max(150),
      message: z.string().trim().min(10, 'Please describe your question in a sentence or two.').max(4000),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    await db()
      .prepare('INSERT INTO support_enquiries (id, user_id, name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(newId(), user?.id ?? null, data.name, data.email, data.subject, data.message, Date.now())
      .run()
    return { ok: true }
  })
