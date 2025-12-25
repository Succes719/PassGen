from flask import Flask, render_template
import secrets

app = Flask(__name__)

# Clé secrète pour les sessions Flask
app.secret_key = secrets.token_hex(32)

@app.route('/')
def bienvenue():
    return render_template('bienvenue.html')

@app.route('/conditions')
def conditions():
    return render_template('conditions.html')

@app.route('/generateur')
def generator():
    return render_template('generateur.html')

if __name__ == '__main__':
    app.run(debug=True)