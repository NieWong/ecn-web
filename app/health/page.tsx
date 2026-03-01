'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface HealthStatus {
  backend: 'checking' | 'ok' | 'error';
  database: 'checking' | 'ok' | 'error';
  endpoints: {
    name: string;
    status: 'checking' | 'ok' | 'error';
    message?: string;
  }[];
}

export default function HealthCheckPage() {
  const [status, setStatus] = useState<HealthStatus>({
    backend: 'checking',
    database: 'checking',
    endpoints: [
      { name: 'GET /posts', status: 'checking' },
      { name: 'GET /categories', status: 'checking' },
      { name: 'POST /auth/login', status: 'checking' },
    ],
  });

  const checkHealth = async () => {
    setStatus({
      backend: 'checking',
      database: 'checking',
      endpoints: [
        { name: 'GET /posts', status: 'checking' },
        { name: 'GET /categories', status: 'checking' },
        { name: 'POST /auth/login', status: 'checking' },
      ],
    });

    // Check backend connectivity
    try {
      await apiClient.get('/health');
      setStatus(prev => ({ ...prev, backend: 'ok' }));
    } catch (error: any) {
      console.error('Backend health check failed:', error);
      setStatus(prev => ({ ...prev, backend: 'error' }));
    }

    // Check posts endpoint
    try {
      await apiClient.get('/posts', { params: { take: 1 } });
      setStatus(prev => ({
        ...prev,
        endpoints: prev.endpoints.map(ep =>
          ep.name === 'GET /posts' ? { ...ep, status: 'ok' } : ep
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      setStatus(prev => ({
        ...prev,
        endpoints: prev.endpoints.map(ep =>
          ep.name === 'GET /posts' ? { ...ep, status: 'error', message } : ep
        ),
      }));
    }

    // Check categories endpoint
    try {
      await apiClient.get('/categories');
      setStatus(prev => ({
        ...prev,
        endpoints: prev.endpoints.map(ep =>
          ep.name === 'GET /categories' ? { ...ep, status: 'ok' } : ep
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      setStatus(prev => ({
        ...prev,
        endpoints: prev.endpoints.map(ep =>
          ep.name === 'GET /categories' ? { ...ep, status: 'error', message } : ep
        ),
      }));
    }

    // Simulate database check (through auth endpoint)
    try {
      // This will fail with 400 but at least confirms the server is processing requests
      await apiClient.post('/auth/login', { email: 'test', password: 'test' });
    } catch (error: any) {
      // 400 or 401 means the endpoint works, just invalid credentials
      if (error.response?.status === 400 || error.response?.status === 401) {
        setStatus(prev => ({
          ...prev,
          database: 'ok',
          endpoints: prev.endpoints.map(ep =>
            ep.name === 'POST /auth/login' ? { ...ep, status: 'ok' } : ep
          ),
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          database: 'error',
          endpoints: prev.endpoints.map(ep =>
            ep.name === 'POST /auth/login' ? { ...ep, status: 'error', message: error.message } : ep
          ),
        }));
      }
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const StatusIcon = ({ status }: { status: HealthStatus['backend'] }) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'ok':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Систем</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-gray-900">API Эрүүл шалгалт</h1>
          </div>
          <Button onClick={checkHealth} className="flex items-center space-x-2 rounded-full bg-gray-900 text-white hover:bg-gray-800">
            <RefreshCw className="h-4 w-4" />
            <span>Шинэчлэх</span>
          </Button>
        </div>

        {/* Connection Info */}
        <div className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-900">API тохиргоо</p>
              <p className="text-sm text-blue-700 mt-1">
                Backend URL: <code className="bg-blue-100 px-2 py-0.5 rounded">
                  {process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'}
                </code>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Backend сервер 4000 порт дээр ажиллаж байгаа баталгаажуулаарай
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="space-y-4">
          {/* Backend Status */}
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Backend сервер</h2>
                <p className="text-sm text-gray-600">API сервертэй холболт</p>
              </div>
              <StatusIcon status={status.backend} />
            </div>
          </div>

          {/* Database Status */}
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Өгөгдлийн сан</h2>
                <p className="text-sm text-gray-600">Өгөгдлийн санд холболт</p>
              </div>
              <StatusIcon status={status.database} />
            </div>
          </div>

          {/* Endpoints Status */}
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">API холбоосууд</h2>
            <div className="space-y-3">
              {status.endpoints.map((endpoint) => (
                <div
                  key={endpoint.name}
                  className="flex items-start justify-between border-b border-black/5 pb-3 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {endpoint.name}
                    </p>
                    {endpoint.message && (
                      <p className="mt-1 text-xs text-red-600">{endpoint.message}</p>
                    )}
                  </div>
                  <StatusIcon status={endpoint.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        {(status.backend === 'error' || status.endpoints.some(e => e.status === 'error')) && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <h3 className="font-semibold text-red-900 mb-3">Асуудал шийдвэрлэх алхамууд</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-red-800">
              <li>Backend сервер ажиллаж байгаа баталгаажуулаарай: <code className="bg-red-100 px-2 py-0.5 rounded">cd D:\dev\ecn-api && npm run dev</code></li>
              <li>Backend 4000 порт дээр ажиллаж байгаа шалгаарай</li>
              <li>Өгөгдлийн сан холбогдсон эсэхийг баталгаажуулаарай (backend console шалгаарай)</li>
              <li>Өгөгдлийн сангийн migration ажиллуулаарай: <code className="bg-red-100 px-2 py-0.5 rounded">npx prisma db push</code></li>
              <li>Өгөгдөл хоосон бол туршилтын өгөгдөл нэмээрэй</li>
              <li>Backend console дээрх алдааны дэлгэрэнгүй мэдээллийг шалгаарай</li>
              <li>Дэлгэрэнгүй мэдээллийн тулд <code className="bg-red-100 px-2 py-0.5 rounded">BACKEND_TROUBLESHOOTING.md</code> үзээрэй</li>
            </ol>
          </div>
        )}

        {/* Success Message */}
        {status.backend === 'ok' && 
         status.database === 'ok' && 
         status.endpoints.every(e => e.status === 'ok') && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-900">
                Бүх систем хэвийн ажиллаж байна! ✅
              </p>
            </div>
            <p className="mt-2 text-sm text-green-700">
              Backend API зөв ажиллаж байна. Апп-аа хэрэглэх боломжтой.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
