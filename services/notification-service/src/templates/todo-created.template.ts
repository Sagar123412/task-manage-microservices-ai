export function todoCreatedTemplate(input: { title: string; dueDate?: string }) {
  const dueText = input.dueDate ? ` Due: ${input.dueDate}.` : "";
  return {
    subject: "A new todo was created",
    text: `Your todo "${input.title}" was created.${dueText}`,
    html: `<p>Your todo "<strong>${input.title}</strong>" was created.${dueText}</p>`,
  };
}
