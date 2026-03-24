'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function RatePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const businessId = params.businessId as string;
  const smsLogId = searchParams.get('ref') || undefined;

  const [business, setBusiness] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: string; googleUrl?: string } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Fetch business info
  useEffect(() => {
    fetch(`/api/business/${businessId}`)
      .then((r) => r.json())
      .then((data) => setBusiness(data.business))
      .catch(() => setBusiness({ name: 'Commerce', address: '' }));
  }, [businessId]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Google redirect countdown
  useEffect(() => {
    if (result?.type === 'GOOGLE' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (result?.type === 'GOOGLE' && countdown === 0 && result.googleUrl) {
      window.location.href = result.googleUrl;
    }
  }, [result, countdown]);

  async function handleSubmit() {
    if (!rating || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, rating, comment, smsLogId }),
      });
      const data = await res.json();
      setResult({ type: data.review.type, googleUrl: data.googleReviewUrl });
      setSubmitted(true);
    } catch {
      alert('Erreur, veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  const displayRating = hoverRating || rating;
  const isPositive = rating >= 4;

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] bg-white rounded-[32px] shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="flex justify-center pt-0">
          <div className="w-[126px] h-[34px] bg-gray-900 rounded-b-[20px]" />
        </div>

        <div className="px-6 py-6 flex flex-col min-h-[600px]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-extrabold text-2xl">
                {business.name?.charAt(0) || 'A'}
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">{business.name}</h1>
            {business.address && (
              <p className="text-sm text-gray-400 mt-1">{business.address}</p>
            )}
          </div>

          {!submitted ? (
            <>
              {/* Rating */}
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  Comment s&apos;est passée<br />votre visite ?
                </h2>
                <div className="flex justify-center gap-2.5 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl transition-all duration-200 ${
                        star <= displayRating
                          ? 'bg-amber-400 border-amber-500 text-white scale-105 shadow-lg shadow-amber-400/30'
                          : 'bg-white border-gray-200 text-gray-300 hover:border-amber-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback for low ratings */}
              {rating > 0 && !isPositive && (
                <div className="mb-4 animate-in slide-in-from-bottom-4">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Qu&apos;est-ce qu&apos;on pourrait améliorer ?
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Dites-nous en plus... (optionnel)"
                    className="w-full h-24 px-4 py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-800 resize-none outline-none focus:border-blue-400 transition-colors placeholder:text-gray-400"
                  />
                </div>
              )}

              {/* Submit */}
              {rating > 0 && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                    isPositive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 active:bg-blue-700'
                      : 'bg-gray-800 text-white shadow-lg shadow-gray-800/20 active:bg-gray-900'
                  } ${submitting ? 'opacity-60' : 'active:scale-[0.98]'}`}
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPositive ? (
                    'Laisser mon avis sur Google →'
                  ) : (
                    'Envoyer mon retour →'
                  )}
                </button>
              )}
            </>
          ) : result?.type === 'GOOGLE' ? (
            /* Success: Google redirect */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-4xl mb-5 shadow-lg shadow-green-500/30">
                ✓
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">Merci beaucoup !</h2>
              <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed">
                Votre avis aide {business.name} à se faire connaître. On vous redirige vers Google.
              </p>
              <div className="mt-6 px-4 py-3 bg-gray-50 rounded-xl flex items-center gap-3 text-xs text-gray-400">
                <div className="w-6 h-6 bg-white rounded-md border border-gray-200 flex items-center justify-center text-blue-600 font-extrabold text-sm flex-shrink-0">
                  G
                </div>
                <span>Redirection vers Google Reviews dans <strong className="text-gray-600">{countdown}</strong>s...</span>
              </div>
            </div>
          ) : (
            /* Success: Private feedback */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl mb-5 shadow-lg shadow-blue-500/30">
                💬
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">Merci pour votre retour !</h2>
              <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed">
                Votre message a bien été envoyé à l&apos;équipe de {business.name}. Ils reviendront vers vous rapidement.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 text-center">
            <p className="text-[11px] text-gray-300">
              Propulsé par <span className="text-blue-400 font-semibold">Avizio</span>
            </p>
            <p className="text-[11px] text-gray-300 font-mono mt-1">{elapsed}s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
