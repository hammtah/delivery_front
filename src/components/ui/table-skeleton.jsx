import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton({ columns }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
          {columns.map((column, colIndex) => (
            <td key={colIndex} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
              <Skeleton className="h-4 w-[80%]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
} 