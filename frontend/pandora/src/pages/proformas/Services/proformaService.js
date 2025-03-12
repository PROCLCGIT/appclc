// src/page/proformas/Services/proformaService.js

import axios from "axios";

const API_URL = "/api/proformas"; // Ajusta la URL de tu backend

export const fetchProforma = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/`);
  return response.data;
};

export const saveProforma = async (proformaData) => {
  const response = await axios.post(API_URL, proformaData);
  return response.data;
};

// Otras funciones como updateProforma, deleteProforma, etc.
