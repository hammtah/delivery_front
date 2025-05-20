import { Toaster } from "@/components/ui/sonner"
export default function PlansLayout({ children }) {
    return (
        <div>
            {children}
            <Toaster />
        </div>
    )
}