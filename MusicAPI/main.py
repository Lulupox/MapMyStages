from flask import Flask, send_file, make_response

app = Flask(__name__)

@app.route('/<path:filename>')
def serve_music(filename):
    if not filename.endswith('.mp3'):
        return 'Invalid file', 400
    response = make_response(send_file('music/' + filename))
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(port=8080)