import { AlertCircle } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface AlertDestructiveProps {
    message: string;
  }

export function AlertDestructive({ message }: AlertDestructiveProps) {
  return (
    <Alert variant="destructive" className="mt-10">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}
