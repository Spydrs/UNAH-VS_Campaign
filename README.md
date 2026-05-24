# UNAH-VS Phishing Campaign

![Logo](./images/phishing_logo.png)

> **Repositorio público para la clase de Seminario de Investigación**

Este repositorio contiene una simulación educativa de una campaña de phishing. El objetivo es demostrar cómo funcionan los ataques de phishing, cómo se pueden detectar y qué medidas tomar para protegerse.

**El contenido es completamente público y está destinado ÚNICAMENTE a fines académicos.**

---

## ⚠️ Aviso importante

- Este material se comparte **solo con propósitos educativos** dentro del curso *Seminario de Investigación*.
- No debe utilizarse para actividades maliciosas o ilegales.
- Los autores no se hacen responsables del mal uso de este código.

---

## ¿Cómo funciona?

La campaña simula un correo de suplantación de identidad (phishing) dirigido a usuarios de una organización ficticia. El flujo básico es:

1. **Generación de credenciales falsas**  
   El script `phishing.py` crea combinaciones de nombres/apellidos para simular víctimas potenciales.

2. **Página de inicio de sesión falsa**  
   Se sirve una copia idéntica a la página de inicio de sesión de Outlook/Office 365 (archivos en `templates/login.html`, `static/actions.js`, `static/style.css`).

3. **Captura de credenciales**  
   Cuando un usuario introduce su contraseña en la página falsa, los datos se registran en un archivo de texto (por ejemplo, `o365_enumeration/final.txt`).

4. **Visualización de resultados**  
   Las credenciales capturadas se guardan localmente para su análisis en el entorno controlado del laboratorio.
