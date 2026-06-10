# UNAH-VS Phishing Campaign

![Logo](./images/image.png)

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

La campaña de phishing simula un ataque de ingeniería social dirigído a estudiantes de UNAH-VS mediante  enlaces a páginas de inicio de sesión falsas de Outlook. 

El flujo básico es:

1. **Generación de credenciales falsas**  
   El script `phishing.py` crea combinaciones de nombres/apellidos para simular víctimas potenciales.

2. **Página de inicio de sesión falsa**  
   Se sirve una copia idéntica a la página de inicio de sesión de Outlook/Office 365 (archivos en `templates/login.html`, `static/actions.js`, `static/style.css`).

3. **Captura de credenciales y Términos de Uso**  
   Cuando un usuario introduce su correo y luego su contraseña, en el último paso aparece una casilla obligatoria de **Términos de Uso / Privacidad**. Esta casilla obliga al usuario a aceptar que los datos (recolectados de forma mínima y sin el uso de cookies) serán utilizados exclusivamente con fines académicos, reforzando la transparencia de la simulación. Los datos (incluyendo el *User-Agent*) se registran en un archivo de texto en `/static/log.txt`.

4. **Páginas Educativas de Privacidad**  
   El proyecto incluye las rutas `/ToS` donde se explica abiertamente a la víctima que esto se trata de un entorno de simulación educativa.
