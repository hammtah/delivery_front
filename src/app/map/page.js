'use client'
import MapComponent from '@/components/MapComponent';
import { useState } from 'react';

export default function MapPage() {
    const [addressForm, setAddressForm] = useState({
        street: '',
        city: '',
        neighborhood: '',
        street_code: 0,
        postal_code: 0,
        province: '',
        position: {
          name: '',
          longitude: '',
          latitude: ''
        }
      });

  return (
    <main className='flex flex-row gap-4 w-full justify-center'>
      <MapComponent addressForm={addressForm} setAddressForm={setAddressForm} />
      <div className="p-4 w-[30%]">
        <h2 className="text-xl font-bold mb-4">Address Details:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(addressForm, null, 2)}
        </pre>
      </div>
    </main>
  );
} 