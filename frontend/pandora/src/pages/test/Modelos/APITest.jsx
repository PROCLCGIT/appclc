import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

export default function APITest() {
  const [url, setUrl] = useState('http://localhost:8000/api/v1/blegal/sri/');
  const [method, setMethod] = useState('GET');
  const [requestData, setRequestData] = useState('{}');
  const [responseData, setResponseData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponseData('');

    try {
      // Preparar los headers
      const headers = {
        'Content-Type': 'application/json',
      };

      // Obtener el token de autenticación si está disponible
      const token = localStorage.getItem('auth-token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Preparar el body para métodos POST, PUT, PATCH
      let data = null;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          data = JSON.parse(requestData);
        } catch (e) {
          setError('Error en el formato JSON del cuerpo de la petición');
          setLoading(false);
          return;
        }
      }

      // Enviar la petición
      let response;
      switch (method) {
        case 'GET':
          response = await axios.get(url, { headers });
          break;
        case 'POST':
          response = await axios.post(url, data, { headers });
          break;
        case 'PUT':
          response = await axios.put(url, data, { headers });
          break;
        case 'PATCH':
          response = await axios.patch(url, data, { headers });
          break;
        case 'DELETE':
          response = await axios.delete(url, { headers });
          break;
        default:
          setError('Método HTTP no soportado');
          setLoading(false);
          return;
      }

      // Mostrar la respuesta
      setResponseData(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('Error en la petición:', err);
      setError(`Error: ${err.message}`);
      
      if (err.response) {
        setResponseData(JSON.stringify({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        }, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  // Template de datos para SRI
  const getSriTemplate = () => {
    const template = {
      empresa: "Empresa Test",
      ruc: "1234567890123",
      usuario: "usuario_test",
      contrasena: "password_test",
      correo: "test@example.com",
      telefono: "123456789",
      representante: "Representante Test"
    };
    setRequestData(JSON.stringify(template, null, 2));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">API Testing Tool</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Petición</CardTitle>
            <CardDescription>Configure los parámetros de su petición</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input 
                id="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="http://localhost:8000/api/v1/blegal/sri/"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Método HTTP</Label>
              <div className="flex space-x-2">
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <Button 
                    key={m}
                    type="button"
                    variant={method === m ? 'default' : 'outline'}
                    onClick={() => setMethod(m)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>
            
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="requestData">Cuerpo de la petición (JSON)</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={getSriTemplate}
                  >
                    Plantilla SRI
                  </Button>
                </div>
                <Textarea 
                  id="requestData" 
                  value={requestData} 
                  onChange={(e) => setRequestData(e.target.value)} 
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSendRequest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Enviando...' : 'Enviar Petición'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Respuesta</CardTitle>
            <CardDescription>Resultado de la petición</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <Textarea 
              value={responseData} 
              readOnly 
              rows={20}
              className="font-mono text-sm"
              placeholder="La respuesta aparecerá aquí..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}