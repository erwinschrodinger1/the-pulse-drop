# Translation Glossary & Key Strategy

## Goal

Use consistent, scalable translation keys so UI copy can grow without key churn.

## Key Naming Rules

- Use domain-first namespaces: `auth`, `common`, `request`, `profile`.
- Use screen or feature second: `auth.login`, `auth.register`, `auth.verifyEmail`.
- Group semantic intent, not visual location:
  - `title`, `subtitle`, `placeholder`, `errors`, `success`, `actions`.
- Use interpolation for dynamic values:
  - `auth.verifyEmail.sentTo: "Sent to {{email}}"`
  - `auth.verifyEmail.resendIn: "Resend in 00:{{seconds}}"`

## Glossary (Canonical Terms)

- Sign In
- Sign Up
- Forgot Password
- Verify Email
- Update Password
- Confirm Email
- OTP
- Recovery Link
- Session
- Continue

## Keep It Simple

1. Always add new text under an existing namespace first.
2. Add English copy first, then fill `np` progressively.
3. Avoid screen-specific duplicates (reuse `common.actions.*` where possible).
4. Keep error messages grouped under `errors`.
5. Keep success messages grouped under `success`.

## Example Patterns

- Button label: `common.actions.signIn`
- Screen title: `auth.login.title`
- Validation error: `auth.login.errors.missingCredentials`
- Success toast: `auth.verifyEmail.success.resendSent`

## Migration Workflow

1. Add key in `locales/en.json`.
2. Mirror key in `locales/np.json`.
3. Replace hardcoded string with `t('...')`.
4. Use interpolation instead of string concat.
5. Re-run error checks.
