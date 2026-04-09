export function userRegisteredTemplate(input: { verificationUrl: string }) {
  return {
    subject: "Verify your email",
    text: `Welcome! Please verify your email by clicking this link: ${input.verificationUrl}`,
    html: `<p>Welcome!</p><p>Please verify your email by clicking <a href="${input.verificationUrl}">this link</a>.</p>`,
  };
}
