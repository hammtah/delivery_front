import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonLoading(props) {
  return (
    <Button disabled>
      <Loader2 className="animate-spin" />
      {props.text}
    </Button>
  )
}
