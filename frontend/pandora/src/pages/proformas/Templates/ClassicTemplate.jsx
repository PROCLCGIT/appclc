// src/page/proformas/Templates/ClassicTemplate.jsx

import React from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ClassicTemplate = ({
  config,
  quote,
  company,
  client,
  items,
  // ...
}) => {
  return (
    <div className="space-y-8">
      {/* Encabezado Clásico */}
      <div className="flex justify-between items-center border-b pb-6">
        {config.showLogo && (
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={company.logo} alt="Company Logo" />
              <AvatarFallback className="bg-gray-200 text-gray-700">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.address}</p>
              {/* ... */}
            </div>
          </div>
        )}
        <div className="text-right">
          <h1 className="text-2xl font-bold">PROFORMA</h1>
          <p className="text-gray-600">#{quote.number}</p>
          <p className="text-gray-600">Fecha: {format(quote.date, "dd/MM/yyyy")}</p>
          {/* ... */}
        </div>
      </div>

      {/* ... Resto del contenido ClassicTemplate ... */}
    </div>
  );
};

export default ClassicTemplate;


