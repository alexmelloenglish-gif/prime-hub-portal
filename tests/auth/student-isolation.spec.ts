// tests/auth/student-isolation.spec.ts
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { authOptions } from '../../lib/auth'
import { getStudentDashboardState, isAdminUser } from '../../lib/student-data'
import { accountIdentityFromSession } from '../../lib/learner-account-resolution'
import { readFileSync } from 'node:fs'

// Helpers to call NextAuth callbacks in isolation
const { jwt, session, signIn, redirect } = authOptions.callbacks as any

test('student default: nova sessão recebe id e role=student', async () => {
  // token inicial vindo do provider
  const token: any = {
    email: 'aluno@example.com',
    sub: 'google-sub-id',
  }

  // user vindo do adapter/provider
  const user: any = {
    id: 'user-id-123',
    role: undefined,
  }

  const updatedToken = await jwt!({ token, user, account: undefined } as any)

  assert.equal(updatedToken.id, 'user-id-123')
  assert.equal(updatedToken.role, 'student')

  const sessionObj: any = { user: { name: 'Aluno', email: token.email } }
  const updatedSession = await session!({ session: sessionObj, token: updatedToken } as any)

  assert.equal(updatedSession.user.id, 'user-id-123')
  assert.equal(updatedSession.user.role, 'student')
})

test('signIn rejeita provedores não Google e logins sem e-mail', async () => {
  const googleOk = await signIn!({
    account: { provider: 'google' } as any,
    profile: { email: 'aluno@example.com' } as any,
  })
  assert.equal(googleOk, true)

  const googleSemEmail = await signIn!({
    account: { provider: 'google' } as any,
    profile: { email: undefined } as any,
  })
  assert.equal(googleSemEmail, false)

  const outroProvider = await signIn!({
    account: { provider: 'github' } as any,
    profile: { email: 'aluno@example.com' } as any,
  })
  assert.equal(outroProvider, false)
})

test('redirect envia para /dashboard em URLs inseguras ou relativas', async () => {
  const baseUrl = 'https://primedigitalhub.com.br'

  // caminho relativo
  const r1 = await redirect!({ url: '/dashboard', baseUrl } as any)
  assert.equal(r1, `${baseUrl}/dashboard`)

  // URL inválida → fallback /dashboard
  const r2 = await redirect!({ url: '::::', baseUrl } as any)
  assert.equal(r2, `${baseUrl}/dashboard`)

  // URL absoluta com origem diferente → fallback /dashboard
  const r3 = await redirect!({ url: 'https://malicioso.com/alguma-coisa', baseUrl } as any)
  assert.equal(r3, `${baseUrl}/dashboard`)
})

test('isAdminUser retorna true para role=admin e emails configurados', () => {
  const adminUser: any = { email: 'admin@example.com', role: 'admin' }
  assert.equal(isAdminUser(adminUser), true)

  const previewUser: any = { email: 'preview@example.com', role: 'student' }
  process.env.ADMIN_PREVIEW_EMAILS = 'preview@example.com'
  assert.equal(isAdminUser(previewUser), true)

  const regularUser: any = { email: 'aluno@example.com', role: 'student' }
  assert.equal(isAdminUser(regularUser), false)
})

test('getStudentDashboardState: aluno só vê os próprios dados em estado de preview', async () => {
  const alunoUser: any = { email: 'aluno@example.com', name: 'Aluno', role: 'student' }
  const state = await getStudentDashboardState(alunoUser, 'outro@example.com')

  assert.equal(state.viewerEmail, 'aluno@example.com')
  // Como não há Firestore configurado neste teste e nenhum snapshot explícito para "aluno@example.com",
  // o estado esperado é de preview sem acesso real.
  assert.equal(state.hasAccess, false)
  assert.equal(state.student, null)
  assert.equal(state.isPreviewingAnotherStudent, false)
})

test('getStudentDashboardState: admin pode pré-visualizar outro aluno (marcado como preview)', async () => {
  const adminUser: any = { email: 'admin@example.com', name: 'Admin', role: 'admin' }
  const state = await getStudentDashboardState(adminUser, 'aluno@example.com')

  assert.equal(state.viewerEmail, 'admin@example.com')
  // Em ambiente de teste sem fontes reais, a Engine devolve preview sem dados persistidos,
  // mas marca que o alvo é diferente do viewer.
  assert.equal(state.isPreviewingAnotherStudent, true)
})


test('learner identity is the authenticated account id, never the email', () => {
  assert.equal(accountIdentityFromSession({ email: 'same@example.com', role: 'student' } as any), null)

  const account = accountIdentityFromSession({
    id: 'account-A',
    email: 'same@example.com',
    role: 'student',
  } as any)

  assert.equal(account?.accountId, 'account-A')
  assert.equal(account?.accountEmail, 'same@example.com')
})

test('dashboard and learner write routes enforce the explicit account-learner relation boundary', () => {
  const studentData = readFileSync('lib/student-data.ts', 'utf8')
  const resolver = readFileSync('lib/learner-account-resolution.ts', 'utf8')
  const vocabularyRoute = readFileSync('app/api/student/vocabulary-reuse/route.ts', 'utf8')
  const audioRoute = readFileSync('app/api/dashboard/action/audio/route.ts', 'utf8')
  const checkInRoute = readFileSync('app/api/journey/gustavo/check-in/route.ts', 'utf8')

  assert.match(studentData, /resolveAuthorizedLearnerRelation/)
  assert.match(studentData, /requestedStudentId:\s*requestedLearner\?\.studentId/)
  assert.match(resolver, /userId:\s*account\.accountId/)
  assert.match(resolver, /status:\s*'ACTIVE'/)
  assert.match(vocabularyRoute, /getStudentDashboardState\(session\.user/)
  assert.match(audioRoute, /getStudentDashboardState\(session\.user/)
  assert.match(checkInRoute, /resolveAuthorizedLearnerRelation/)
  assert.match(checkInRoute, /requestedStudentId:\s*'stu_4c4da6c04ac4'/)
})
