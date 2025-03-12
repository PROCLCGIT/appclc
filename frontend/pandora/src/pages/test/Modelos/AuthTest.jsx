import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';

export default function AuthTest() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authResult, setAuthResult] = useState(null);
  const [tokens, setTokens] = useState({
    accessToken: localStorage.getItem('auth-token') || '',
    refreshToken: localStorage.getItem('refresh-token') || ''
  });
  const [verifyResult, setVerifyResult] = useState(null);
  const [refreshResult, setRefreshResult] = useState(null);
  
  // Función para realizar login directo
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setAuthResult(null);
    
    try {
      // URL completa, sin usar la instancia de axios configurada
      const response = await axios.post('http://localhost:8000/api/v1/auth/login/', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setAuthResult({
        status: response.status,
        data: response.data
      });
      
      // Guardar tokens
      if (response.data?.access && response.data?.refresh) {
        localStorage.setItem('auth-token', response.data.access);
        localStorage.setItem('refresh-token', response.data.refresh);
        localStorage.setItem('last-auth-prompt', Date.now().toString());
        
        setTokens({
          accessToken: response.data.access,
          refreshToken: response.data.refresh
        });
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Función para verificar token
  const handleVerifyToken = async () => {
    if (!tokens.accessToken) {
      setError({ message: 'No hay token de acceso disponible' });
      return;
    }
    
    setLoading(true);
    setVerifyResult(null);
    
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/token/verify/', {
        token: tokens.accessToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setVerifyResult({
        status: response.status,
        data: response.data,
        valid: true,
        message: 'Token válido'
      });
    } catch (err) {
      console.error('Error verificando token:', err);
      setVerifyResult({
        status: err.response?.status,
        data: err.response?.data,
        valid: false,
        message: 'Token inválido'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Función para refrescar token
  const handleRefreshToken = async () => {
    if (!tokens.refreshToken) {
      setError({ message: 'No hay refresh token disponible' });
      return;
    }
    
    setLoading(true);
    setRefreshResult(null);
    
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/token/refresh/', {
        refresh: tokens.refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setRefreshResult({
        status: response.status,
        data: response.data
      });
      
      // Guardar nuevo token de acceso
      if (response.data?.access) {
        localStorage.setItem('auth-token', response.data.access);
        
        setTokens(prev => ({
          ...prev,
          accessToken: response.data.access
        }));
      }
    } catch (err) {
      console.error('Error refrescando token:', err);
      setRefreshResult({
        status: err.response?.status,
        data: err.response?.data,
        message: 'Error al refrescar token'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Efecto para cargar tokens del localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('auth-token');
    const refreshToken = localStorage.getItem('refresh-token');
    
    if (accessToken || refreshToken) {
      setTokens({
        accessToken: accessToken || '',
        refreshToken: refreshToken || ''
      });
    }
  }, []);
  
  // Función para borrar todos los tokens
  const handleClearTokens = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('last-auth-prompt');
    
    setTokens({
      accessToken: '',
      refreshToken: ''
    });
    
    setVerifyResult(null);
    setRefreshResult(null);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Auth Testing Tool</h1>
      
      <Tabs defaultValue="login">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="token">Token Management</TabsTrigger>
          <TabsTrigger value="status">Auth Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login Testing</CardTitle>
              <CardDescription>Prueba el proceso de autenticación directamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Ingrese su usuario"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Ingrese su contraseña"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                  <div><strong>Error:</strong> {error.message}</div>
                  {error.status && <div>Status: {error.status}</div>}
                  {error.data && (
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(error.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
              
              {authResult && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
                  <div><strong>Login exitoso! Status:</strong> {authResult.status}</div>
                  <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                    {JSON.stringify({
                      access: authResult.data.access ? `${authResult.data.access.substring(0, 10)}...` : null,
                      refresh: authResult.data.refresh ? `${authResult.data.refresh.substring(0, 10)}...` : null
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleLogin} 
                disabled={loading || !username || !password}
                className="w-full"
              >
                {loading ? 'Procesando...' : 'Iniciar Sesión'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="token">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tokens Actuales</CardTitle>
                <CardDescription>Tokens almacenados en localStorage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Access Token:</Label>
                    <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                      {tokens.accessToken 
                        ? `${tokens.accessToken.substring(0, 20)}...${tokens.accessToken.substring(tokens.accessToken.length - 10)}` 
                        : 'No hay token almacenado'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Refresh Token:</Label>
                    <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                      {tokens.refreshToken 
                        ? `${tokens.refreshToken.substring(0, 20)}...${tokens.refreshToken.substring(tokens.refreshToken.length - 10)}` 
                        : 'No hay token almacenado'}
                    </div>
                  </div>
                  
                  {localStorage.getItem('last-auth-prompt') && (
                    <div>
                      <Label className="text-sm font-medium">Última autenticación:</Label>
                      <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                        {new Date(parseInt(localStorage.getItem('last-auth-prompt'))).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={handleClearTokens}
                  disabled={!tokens.accessToken && !tokens.refreshToken}
                  className="w-full"
                >
                  Borrar Tokens
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Verificar Token</CardTitle>
                </CardHeader>
                <CardContent>
                  {verifyResult && (
                    <div className={`p-3 rounded-md ${verifyResult.valid ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                      <div><strong>{verifyResult.message}</strong></div>
                      {verifyResult.status && <div>Status: {verifyResult.status}</div>}
                      {verifyResult.data && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(verifyResult.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleVerifyToken} 
                    disabled={loading || !tokens.accessToken}
                    className="w-full"
                  >
                    Verificar Token
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Refrescar Token</CardTitle>
                </CardHeader>
                <CardContent>
                  {refreshResult && (
                    <div className={`p-3 rounded-md ${refreshResult.status === 200 ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                      <div><strong>{refreshResult.status === 200 ? 'Token refrescado con éxito' : refreshResult.message}</strong></div>
                      {refreshResult.status && <div>Status: {refreshResult.status}</div>}
                      {refreshResult.data && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify({
                            access: refreshResult.data.access ? `${refreshResult.data.access.substring(0, 10)}...` : null
                          }, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleRefreshToken} 
                    disabled={loading || !tokens.refreshToken}
                    className="w-full"
                  >
                    Refrescar Token
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Autenticación</CardTitle>
              <CardDescription>Información sobre el estado actual de autenticación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Access Token</div>
                    <div className="mt-1 text-lg font-semibold">
                      {tokens.accessToken ? (
                        <span className="text-green-600">Disponible</span>
                      ) : (
                        <span className="text-red-600">No disponible</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Refresh Token</div>
                    <div className="mt-1 text-lg font-semibold">
                      {tokens.refreshToken ? (
                        <span className="text-green-600">Disponible</span>
                      ) : (
                        <span className="text-red-600">No disponible</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Estado</div>
                    <div className="mt-1 text-lg font-semibold">
                      {tokens.accessToken && tokens.refreshToken ? (
                        <span className="text-green-600">Autenticado</span>
                      ) : (
                        <span className="text-red-600">No Autenticado</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Última Auth</div>
                    <div className="mt-1 text-lg font-semibold">
                      {localStorage.getItem('last-auth-prompt') ? (
                        <span className="text-green-600">
                          {new Date(parseInt(localStorage.getItem('last-auth-prompt'))).toLocaleTimeString()}
                        </span>
                      ) : (
                        <span className="text-red-600">No hay datos</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Depuración de Token</h3>
                  {tokens.accessToken ? (
                    <div>
                      <div className="text-sm font-medium mb-1">Contenido del Token:</div>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                        {(() => {
                          try {
                            const parts = tokens.accessToken.split('.');
                            if (parts.length !== 3) return 'Formato de token inválido';
                            
                            const payload = JSON.parse(atob(parts[1]));
                            return JSON.stringify({
                              header: JSON.parse(atob(parts[0])),
                              payload,
                              exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No disponible',
                              iat: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'No disponible'
                            }, null, 2);
                          } catch (e) {
                            return `Error al decodificar token: ${e.message}`;
                          }
                        })()}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-red-600">No hay token disponible para analizar</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}