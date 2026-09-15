export default function Inventory() {
  // 1. Added 'const' declaration
  const items = [
    { id: 1, name: "Item 1", quantity: 10, price: 100 },
    { id: 2, name: "Item 2", quantity: 5, price: 50 },
    { id: 3, name: "Item 3", quantity: 20, price: 200 },
    { id: 4, name: "Item 4", quantity: 15, price: 150 },
    { id: 5, name: "Item 5", quantity: 8, price: 80 },
    { id: 6, name: "Item 6", quantity: 12, price: 120 },
    { id: 7, name: "Item 7", quantity: 18, price: 180 },
    { id: 8, name: "Item 8", quantity: 25, price: 250 },
    { id: 9, name: "Item 9", quantity: 30, price: 300 },
  { id: 1, name: "Item 1", quantity: 10, price: 100 },
    { id: 2, name: "Item 2", quantity: 5, price: 50 },
    { id: 3, name: "Item 3", quantity: 20, price: 200 },
    { id: 4, name: "Item 4", quantity: 15, price: 150 },
    { id: 5, name: "Item 5", quantity: 8, price: 80 },
    { id: 6, name: "Item 6", quantity: 12, price: 120 },
    { id: 7, name: "Item 7", quantity: 18, price: 180 },
    { id: 8, name: "Item 8", quantity: 25, price: 250 },
    { id: 9, name: "Item 9", quantity: 30, price: 300 },]
  ;

  return (
    // Added 'flex-col gap-3' so the items stack vertically with spacing
    <div className="flex flex-col items-center h-[95vh] p-4 bg-gray-50 rounded-[10px] gap-3 overflow-y-auto">
      {/* 2. Wrapped JS expression in curly braces { } */}
      {items.map((item) => (
        // 3. Added unique 'key' prop
        <div
          key={item.id}
          className=" text-xs p-3 rounded-md w-[99%]  bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          {item.name} - Qty: {item.quantity}, Price: ${item.price}
        </div>
      ))}
    </div>
  );
}