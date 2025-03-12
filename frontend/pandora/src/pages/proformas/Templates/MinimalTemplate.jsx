// src/page/proformas/Templates/MinimalTemplate.jsx

import React from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MinimalTemplate = ({
  config,
  quote,
  company,
  client,
  items,
  // ...
}) => {
  return (
    <div className="space-y-6">
      {/* Encabezado Minimalista */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Proforma #{quote.number}</h1>
          <p className="text-gray-600">Emitida: {format(quote.date, "dd MMM, yyyy")}</p>
        </div>
        {config.showLogo && (
          <Avatar className="h-14 w-14">
            <AvatarImage src={company.logo} alt="Company Logo" />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {company.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* ... Resto del contenido MinimalTemplate ... */}
    </div>
  );
};

export default MinimalTemplate;
