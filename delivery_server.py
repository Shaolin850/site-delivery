from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cardapio.html')
def cardapio():
    return render_template('cardapio.html')

@app.route('/finalizar_pedido.html')
def finalizar_pedido():
    return render_template('finalizar_pedido.html')

if __name__ == '__main__':
    app.run(debug=True)
