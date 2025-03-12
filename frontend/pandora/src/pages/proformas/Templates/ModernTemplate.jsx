// src/page/proformas/Templates/ModernTemplate.jsx

import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Search, Trash, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ModernTemplate = ({
  config,
  quote,
  company,
  client,
  items,
  filteredProducts,
  activeDataSource,
  searchTerm,
  setSearchTerm,
  setActiveDataSource,
  addItem,
  updateItem,
  removeItem,
  clearForm,
  formatCurrency,
  // ...
}) => {
  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Proforma</h1>
          <p className="text-gray-600 mt-1">#{quote.number}</p>
          <Badge className="mt-2" variant="outline">
            Válida hasta: {quote.expiryDate ? format(quote.expiryDate, "PPP") : ""}
          </Badge>
        </div>
        {config.showLogo && (
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={company.logo} alt="Company Logo" />
                <AvatarFallback className="bg-blue-500 text-white">
                  {company.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-800">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.email}</p>
              <p className="text-sm text-gray-600">{company.phone}</p>
              <p className="text-sm text-gray-600">{company.website}</p>
            </div>
          </div>
        )}
      </div>

      {/* ... Resto de tu contenido ModernTemplate ... */}
      {/* Ejemplo de cómo extraer la tabla de items a un componente aparte */}
      {/* Te ahorras que ModernTemplate sea gigante */}

      <Button onClick={clearForm} variant="outline" className="mt-4">
        <RefreshCw className="h-4 w-4 mr-2" /> Nueva
      </Button>
    </div>
  );
};

export default ModernTemplate;
