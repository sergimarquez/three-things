import { Entry } from "../hooks/useEntries";

type Props = {
  entry: Entry;
};

export default function EntryCard({ entry }: Props) {
  return (
    <div className="border p-4 rounded shadow-sm space-y-2">
      <div className="text-sm text-gray-500">
        {entry.date} • {entry.time}
      </div>
      <ul className="list-disc pl-6">
        {entry.items.map((item, i) =>
          item?.text ? (
            <li key={i} className="flex justify-between">
              <span>{item.text}</span>
              {item.favorite && <span className="text-yellow-500">★</span>}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}
