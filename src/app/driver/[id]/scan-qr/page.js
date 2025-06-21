'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/utils/api';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
export default function ScanQRPage() {
  const router = useRouter();
//   const { deliveryId } = params;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState('');
  const [codeConfirming, setCodeConfirming] = useState(false);
  const params = useParams();
  const deliveryId = params.id ;
  const handleCodeConfirm = async () => {
    if (!code) return;
    setCodeConfirming(true);
    setError(null);
    setSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/delivery/${deliveryId}/confirm`), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.back(), 500);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to confirm delivery');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setCodeConfirming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">Confirm Delivery</h1>
      <div className="w-full max-w-xs bg-muted rounded-lg flex flex-col items-center justify-center mb-6 p-6">
        <Input
          type="text"
          placeholder="Enter delivery code"
          value={code}
          onChange={e => setCode(e.target.value)}
          disabled={codeConfirming}
        />
        <Button
          className="w-full mt-4"
          onClick={handleCodeConfirm}
          disabled={codeConfirming || !code}
        >
          {codeConfirming ? 'Confirming...' : 'Confirm Delivery'}
        </Button>
        {success && <span className="text-green-600 text-xs mt-2">Delivery Confirmed!</span>}
        {error && <span className="text-red-500 text-xs mt-2">{error}</span>}
      </div>
      <Button variant="outline" className="w-full max-w-xs" onClick={() => router.back()} disabled={codeConfirming}>
        Back
      </Button>
    </div>
  );
}
