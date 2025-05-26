import { Toaster } from "@/components/ui/sonner"
import RestaurantOwnerSidebar from "@/components/RestaurantsOwnerSidebar"
export default function PlansLayout({ children }) {
    return (
        <div>
            <RestaurantOwnerSidebar />
            {children}
            <Toaster />
        </div>
    )
}