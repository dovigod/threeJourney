import app from './app';

const PORT = 8000;

const handleListening = () => console.log(`✅listening on localhost:${PORT}`);

app.listen(PORT, handleListening);
