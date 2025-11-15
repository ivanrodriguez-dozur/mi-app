# Integración de Wallet Polygon - Boom Coin (BMC)

## 📋 Resumen

Esta aplicación ahora incluye una integración completa con la blockchain de Polygon para gestionar tokens BMC (Boom Coin). Los usuarios pueden crear wallets, ver balances en tiempo real, y enviar tokens directamente desde la app.

## 🔧 Configuración Técnica

### Token BMC
- **Contrato:** `0x1328EC1004e5d0712451FF1b8d7078eF8eCF4d8C`
- **Red:** Polygon Mainnet (Chain ID: 137)
- **Estándar:** ERC-20
- **Símbolo:** BMC
- **Decimales:** 18

### RPC Endpoint
- **URL:** https://polygon-rpc.com
- **Alternativas:** 
  - https://polygon-mainnet.g.alchemy.com/v2/[TU_API_KEY]
  - https://polygon-mainnet.infura.io/v3/[TU_PROJECT_ID]

## 🚀 Funcionalidades Implementadas

### 1. Creación de Wallet
- Genera wallets nuevas con frase semilla de 12 palabras
- Almacenamiento seguro local usando AsyncStorage
- Copia de frase semilla para backup

### 2. Importación de Wallet
- Soporta frase semilla (12 o 24 palabras)
- Soporta clave privada directa
- Validación de formato

### 3. Visualización de Balance
- Balance de tokens BMC en tiempo real
- Balance de MATIC para gas fees
- Actualización manual y automática cada 30 segundos

### 4. Transferencias
- Envío de tokens BMC a cualquier dirección Ethereum/Polygon
- Validación de dirección destino
- Estimación de costo de gas antes de enviar
- Confirmación on-chain

### 5. Seguridad
- Frases semilla guardadas localmente (nunca enviadas a servidor)
- Validación de direcciones
- Verificación de saldo antes de transferir
- Manejo de errores de red y gas

## 📱 Flujo de Usuario

### Primera Vez
1. Usuario abre la wallet
2. Se muestra WalletSetupModal
3. Usuario elige:
   - **Crear nueva wallet:** Se genera frase semilla → Usuario la guarda
   - **Importar wallet:** Usuario ingresa su frase semilla o clave privada

### Uso Normal
1. Usuario ve su balance de BMC
2. Para enviar:
   - Click en "Enviar BMC"
   - Ingresa dirección destino (0x...)
   - Ingresa cantidad
   - Ve estimación de gas
   - Confirma transacción
3. Transacción se procesa en blockchain
4. Balance se actualiza automáticamente

## 🔐 Seguridad

### Buenas Prácticas Implementadas
- ✅ Almacenamiento local seguro con AsyncStorage
- ✅ No se exponen claves privadas en logs
- ✅ Validación de todas las entradas
- ✅ Estimación de gas antes de transacciones
- ✅ Manejo de errores robusto

### Recomendaciones para Producción
1. **Encriptación adicional:** Considerar usar `expo-secure-store` o similar para encriptar las claves
2. **Biometría:** Agregar autenticación biométrica antes de acceder a wallet
3. **Backup en la nube:** Implementar backup encriptado opcional
4. **Límites de transacción:** Considerar límites diarios/por transacción
5. **RPC propio:** Usar un RPC endpoint propio o de pago para mejor confiabilidad

## ⚙️ Variables de Entorno

```env
# Polygon Configuration
EXPO_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
EXPO_PUBLIC_POLYGON_CHAIN_ID=137
EXPO_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1328EC1004e5d0712451FF1b8d7078eF8eCF4d8C
EXPO_PUBLIC_TOKEN_NAME=Boom Coin
EXPO_PUBLIC_TOKEN_SYMBOL=BMC
EXPO_PUBLIC_TOKEN_DECIMALS=18
```

## 📦 Dependencias Agregadas

```json
{
  "ethers": "^6.13.0",
  "react-native-get-random-values": "^1.11.0",
  "expo-crypto": "^14.0.1"
}
```

## 🧪 Pruebas

### Para Probar en Desarrollo

1. **Crear Wallet de Prueba:**
   ```bash
   # La app genera automáticamente una wallet
   # Guarda la frase semilla mostrada
   ```

2. **Obtener MATIC para Gas:**
   - Usa un faucet: https://faucet.polygon.technology/
   - O compra en exchange y envía a tu dirección

3. **Obtener Tokens BMC:**
   - Contacta al administrador del token
   - O usa un exchange/DEX que tenga BMC

4. **Probar Transferencia:**
   - Envía pequeña cantidad primero
   - Verifica en PolygonScan: https://polygonscan.com/

### Debugging

```typescript
// Ver logs en la consola
// Los servicios ya incluyen console.error para errores
// Para más detalle, temporalmente agrega:
console.log('Balance:', await polygonWalletService.getTokenBalance());
console.log('Address:', polygonWalletService.getAddress());
```

## 🐛 Problemas Comunes

### "Saldo insuficiente de MATIC para pagar gas"
- **Solución:** El usuario necesita MATIC en su wallet. Enviar al menos 0.01 MATIC.

### "Dirección inválida"
- **Solución:** Verificar que la dirección comience con "0x" y tenga 42 caracteres.

### "No se pudo conectar al RPC"
- **Solución:** Verificar conexión a internet o cambiar RPC endpoint.

### "Transacción pendiente muy tiempo"
- **Solución:** Gas price puede ser muy bajo. Polygon suele confirmar en 2-5 segundos.

## 📊 Monitoreo

### Herramientas Útiles
- **PolygonScan:** https://polygonscan.com/address/[WALLET_ADDRESS]
- **Ver Token:** https://polygonscan.com/token/0x1328EC1004e5d0712451FF1b8d7078eF8eCF4d8C
- **Gas Tracker:** https://polygonscan.com/gastracker

## 🔄 Próximas Mejoras Sugeridas

1. **Historial de Transacciones**
   - Guardar historial local
   - Sincronizar con blockchain usando eventos

2. **Multi-wallet**
   - Soporte para múltiples wallets
   - Cambio entre wallets

3. **QR Codes**
   - Escanear dirección destino con cámara
   - Generar QR de tu dirección para recibir

4. **Notificaciones**
   - Push cuando se reciben tokens
   - Confirmación de transacciones

5. **Integración con Marketplace**
   - Pagar productos con BMC
   - Descuentos especiales con BMC

6. **WalletConnect**
   - Conectar con DApps externas
   - Usar wallet en otros servicios

## 📞 Soporte

Para problemas con la integración blockchain:
1. Verificar logs de la app
2. Verificar transacción en PolygonScan
3. Verificar que el contrato BMC esté activo
4. Contactar al equipo de desarrollo

## ⚠️ Disclaimers

- Los usuarios son responsables de guardar su frase semilla
- La pérdida de la frase semilla significa pérdida permanente de fondos
- Las transacciones en blockchain son irreversibles
- Siempre probar con pequeñas cantidades primero

## 📄 Licencia

Este código es parte de la aplicación mi-app y sigue la misma licencia del proyecto principal.
