import Image from "next/image";
import HomePage from '../components/homePage';

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-6 rounded-lg shadow-lg">
     
        <h1 className="text-3xl font-semibold mb-4">ETH Price Watcher</h1>
        <HomePage />
        <p className="text-sm"></p>
      </div>
    </div>
  );
}
