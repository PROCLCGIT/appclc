// src/components/proformas/ProformaPDF.jsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 50,
  },
  proformaInfo: {
    alignItems: 'flex-end',
  },
  proformaNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  proformaDate: {
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  clientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoColumn: {
    flex: 1,
    marginRight: 20,
  },
  label: {
    color: '#666',
    marginBottom: 3,
  },
  value: {
    marginBottom: 10,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  col1: { width: '40%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
  },
  terms: {
    fontSize: 10,
    color: '#666',
    marginBottom: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#666',
  },
});

const ProformaPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Image
          style={styles.logo}
          src="/logo.png"
        />
        <View style={styles.proformaInfo}>
          <Text style={styles.proformaNumber}>
            PROFORMA #{data.number}
          </Text>
          <Text style={styles.proformaDate}>
            Fecha: {new Date(data.date).toLocaleDateString()}
          </Text>
          <Text style={styles.proformaDate}>
            Válido hasta: {new Date(data.valid_until).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Información del Cliente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
        <View style={styles.clientInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{data.client.name}</Text>
            <Text style={styles.label}>RUC:</Text>
            <Text style={styles.value}>{data.client.document_number}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{data.client.address}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.client.email}</Text>
          </View>
        </View>
      </View>

      {/* Condiciones Comerciales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONDICIONES COMERCIALES</Text>
        <View style={styles.clientInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Términos de Pago:</Text>
            <Text style={styles.value}>{data.payment_terms}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Tiempo de Entrega:</Text>
            <Text style={styles.value}>{data.delivery_time}</Text>
          </View>
        </View>
      </View>

      {/* Detalle de Productos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALLE DE PRODUCTOS</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Descripción</Text>
            <Text style={styles.col2}>Cantidad</Text>
            <Text style={styles.col3}>Precio Unit.</Text>
            <Text style={styles.col4}>Descuento</Text>
            <Text style={styles.col5}>Total</Text>
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>
                S/ {item.unit_price.toFixed(2)}
              </Text>
              <Text style={styles.col4}>
                {item.discount_percentage}%
              </Text>
              <Text style={styles.col5}>
                S/ {((item.quantity * item.unit_price) * (1 - item.discount_percentage/100)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              S/ {data.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IGV (18%):</Text>
            <Text style={styles.totalValue}>
              S/ {data.tax.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              S/ {data.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Pie de Página */}
      <View style={styles.footer}>
        <Text style={styles.terms}>
          {data.terms_conditions}
        </Text>
        <Text style={styles.terms}>
          {data.notes}
        </Text>
        <Text style={styles.pageNumber}>
          Página 1 de 1
        </Text>
      </View>
    </Page>
  </Document>
);

export default ProformaPDF;