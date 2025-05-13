// Simple toast hook
export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
  }: {
    title: string
    description?: string
    variant?: "default" | "destructive"
  }) => {
    console.log(`Toast: ${title} - ${description || ""} (${variant})`)
    // In a real app, this would show a toast notification
  }

  return { toast }
}
