import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  HelpCircle,
  ChevronRight,
  BarChart2,
  Medal,
  Compass,
  BusFront,
} from 'lucide-react';

export default function ColectivoAdivinanza() {
  const [colectivos, setColectivos] = useState([]);
  const [respuestaDelDia, setRespuestaDelDia] = useState(null);
  const [guess, setGuess] = useState('');
  const [historial, setHistorial] = useState([]);
  const [showIndicators, setShowIndicators] = useState(false);
  const [juegoGanado, setJuegoGanado] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3001/colectivos')
      .then((res) => {
        setColectivos(res.data);
        const fechaHoy = new Date().toISOString().slice(0, 10);
        const hash = fechaHoy.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const index = hash % res.data.length;
        setRespuestaDelDia(res.data[index]);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleGuessSubmit = () => {
    if (juegoGanado) return;

    const colectivoIngresado = colectivos.find(
      (c) => c.linea === guess.trim()
    );
    if (colectivoIngresado) {
      setHistorial(prev => [...prev, colectivoIngresado]);
      if (colectivoIngresado.linea === respuestaDelDia?.linea) {
        setJuegoGanado(true);
      }
    } else {
      alert('Esa línea no está en la base de datos.');
    }
    setGuess('');
  };

  const compararValor = (valor, campo) => {
    if (!respuestaDelDia) return 'bg-gray-600';

    if (campo === 'anio') {
      const margin = 2;
      const numValor = parseInt(valor);
      const numCorrecto = parseInt(respuestaDelDia.anio);

      if (isNaN(numValor) || isNaN(numCorrecto)) return 'bg-red-600';
      if (numValor === numCorrecto) return 'bg-green-600';

      const diferencia = Math.abs(numValor - numCorrecto);
      if (diferencia <= margin) return 'bg-yellow-600';
      return numValor < numCorrecto ? 'bg-blue-600' : 'bg-violet-600';
    }

    if (campo === 'color') {
      const coloresUsuario = valor.split(/[\s,/]+/).map(c => c.trim().toLowerCase()).filter(Boolean);
      const coloresCorrectos = respuestaDelDia.color.split(/[\s,/]+/).map(c => c.trim().toLowerCase()).filter(Boolean);

      if (coloresUsuario.join(',') === coloresCorrectos.join(',')) return 'bg-green-600';

      const coincidencias = coloresUsuario.filter(c => coloresCorrectos.includes(c));
      return coincidencias.length > 0 ? 'bg-yellow-600' : 'bg-red-600';
    }

    const valorUsuario = valor.trim().toLowerCase();
    const valorCorrecto = respuestaDelDia[campo].trim().toLowerCase();
    return valorUsuario === valorCorrecto ? 'bg-green-600' : 'bg-red-600';
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 text-white">
      <div className="w-full bg-gray-800 p-4 flex justify-between items-center border-b border-blue-500">
        <BusFront size={24} className="text-yellow-400" />
        <h1 className="text-2xl font-bold text-yellow-400 text-center">
          Bondle
        </h1>
        <span className="text-xs text-gray-400">AR</span>
      </div>

      <div className="flex justify-center mt-4 space-x-3">
        <button className="p-2 bg-blue-500 rounded-full hover:bg-blue-600">
          <HelpCircle size={20} />
        </button>
        <button className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
          <Medal size={20} />
        </button>
        <button className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
          <Compass size={20} />
        </button>
      </div>

      <div className="flex items-center mt-4 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 space-x-2">
        <BarChart2 size={20} />
        <span>{historial.length}</span>
        <HelpCircle size={20} />
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700 w-11/12 max-w-lg text-center">
        <h2 className="text-xl font-semibold">
          ¡Adiviná el colectivo del día!
        </h2>
      </div>

      <div className="mt-6 relative w-11/12 max-w-lg">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGuessSubmit()}
          placeholder={juegoGanado ? "¡Adivinaste!" : "Escribí el número de línea"}
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white pr-10"
          disabled={juegoGanado}
        />
        <button
          onClick={handleGuessSubmit}
          className="absolute right-2 top-2 bg-blue-500 rounded-full p-2 hover:bg-blue-600 disabled:opacity-50"
          disabled={juegoGanado}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-2 text-sm text-gray-400">
        1580 personas ya lo intentaron!
      </div>

      {historial.length > 0 && (
        <div className="mt-8 grid grid-cols-6 gap-1 text-xs w-11/12 max-w-4xl text-center">
          {['Línea', 'Color', 'Zona', 'Tipo', 'Empresa', 'Año'].map((title, idx) => (
            <div key={idx} className="bg-gray-800 p-2 rounded">
              {title}
            </div>
          ))}
        </div>
      )}

      {historial.map((c, i) => (
        <div key={i} className="mt-1 grid grid-cols-6 gap-1 text-sm w-11/12 max-w-4xl text-center">
          <div className="bg-gray-700 p-2 rounded font-bold">{c.linea}</div>
          <div className={`${compararValor(c.color, 'color')} p-2 rounded`}>
            {c.color}
          </div>
          <div className={`${compararValor(c.zona, 'zona')} p-2 rounded`}>
            {c.zona}
          </div>
          <div className={`${compararValor(c.tipo, 'tipo')} p-2 rounded`}>
            {c.tipo}
          </div>
          <div className={`${compararValor(c.empresa, 'empresa')} p-2 rounded`}>
            {c.empresa}
          </div>
          <div className={`${compararValor(c.anio, 'anio')} p-2 rounded`}>
            {c.anio}
          </div>
        </div>
      ))}

      {juegoGanado && (
        <div className="mt-4 text-green-400 font-bold text-lg">
          🎉 ¡Adivinaste el colectivo del día!
        </div>
      )}

      <button
        onClick={() => setShowIndicators(!showIndicators)}
        className="mt-8 text-sm underline text-gray-400 hover:text-white"
      >
        {showIndicators ? "Ocultar indicadores" : "Ver referencias de colores"}
      </button>

      {showIndicators && (
        <div className="mt-4 bg-gray-800 p-4 rounded-lg border border-gray-700 w-11/12 max-w-md">
          <h3 className="text-center mb-2">Referencias de colores</h3>
          <div className="grid grid-cols-5 gap-2 text-xs text-center">
            {[
              ['green-600', 'Correcto'],
              ['yellow-600', 'Cercano'],
              ['red-600', 'Incorrecto'],
              ['blue-600', 'Más nuevo'],
              ['violet-600', 'Más viejo'],
            ].map(([color, label], i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-6 h-6 ${color === 'violet-600' ? 'bg-violet-600' : `bg-${color}`} rounded mb-1`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
