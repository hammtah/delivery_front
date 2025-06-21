'use client';
import PaymentSuccessPage from '@/app/restaurants-owner/payment/success/page';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

export default function QRScanner({ onScan, onError }) {
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let html5QrCode;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (!isMounted) return;
      html5QrCode = new Html5Qrcode('reader',
        {
            qrbox: { width: 250, height: 250 },
            fps: 10,
        }
      );
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.render((result)=>{
        html5QrCodeRef.clear();
        setScanResult(result);
        console.log("success")
      },()=>{
        console.log("error")
      })
    //   html5QrCode
    //     .start(
    //       { facingMode: 'environment' },
    //       {
    //         fps: 10,
    //         qrbox: { width: 250, height: 250 },
    //       },
    //       (decodedText) => {
    //         onScan(decodedText);
    //         html5QrCode.stop();
    //       },
    //       (error) => {
    //         // do nothing for scan errors
    //       }
    //     )
    //     .catch((err) => {
    //       onError('Camera error: ' + err);
    //     });
    });

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear().catch(() => {});
      }
    };
  }, [onScan, onError]);

  return <div id="qr-reader" className="w-full h-56" />;
}
