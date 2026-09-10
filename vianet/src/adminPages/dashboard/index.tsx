import {useSelector} from"react-redux"


export default function Dashboard() {
  const { test } = useSelector((state: any) => state.user);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <h1 className="font-medium">Dashboard</h1>
        <p>Test value from user slice: {test}</p>
        
      </div>
      <h1>Dashboard</h1>
    </div>
  )
}

