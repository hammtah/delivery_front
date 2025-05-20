import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { Button } from "@/components/ui/button"
  import { buttonVariants } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"


const token = "1|uCj7t6vtHlvdsKziLcoJjQ5xAeeYdfpiSQq0JUqS0237653b"
async function getRestaurantsOwners(){
    const res = await fetch('http://127.0.0.1:8000/api/restaurant',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    return res.json()
}
export default async function Home() {
    const restaurantsOwners = await getRestaurantsOwners()
    console.log(restaurantsOwners.data)
  return (
    <div className="flex flex-row gap-6 flex-wrap justify-center">
        {restaurantsOwners.data.map(owner => (
        <Card key={owner.id} className="w-1/4">
            <CardHeader className="flex flex-row gap-4 justify-start">
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-4 ">
                    <CardTitle>{owner.name}</CardTitle>
                    <CardDescription>{owner.restaurants_admin.user.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <p>{owner.description.slice(0, 100)}...</p>
            </CardContent>
            <CardFooter className="relative">
                {/* <p><button className="bg-rose-400 rounded-md text-white p-[16px] py-[4px] hover:bg-rose-600 cursor-pointer">Edit</button></p> */}
                <Button variant="outline" className="cursor-pointer w-[72px]">View</Button>
                <Badge variant="outline" className="absolute bottom-[8px] right-[8px] bg-black text-white">{owner.address? owner.address : "No address"}</Badge>
            </CardFooter>
        </Card>
        ))}
  </div>
)
}
  