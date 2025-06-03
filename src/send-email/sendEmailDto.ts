export class sendEmailRequest {
  type: 'forget-password' | 'account-activation'
  context: Record<string, any>
  to: string
  subject: string
}

