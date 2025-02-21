import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import './App.css';
import { IoEarth } from "react-icons/io5";
import { GiChemicalDrop as GiChemicalDropIcon, GiSoccerBall } from "react-icons/gi";
import { IoIosArrowBack } from "react-icons/io";
import { MdTheaterComedy } from "react-icons/md";
import { FaPaintBrush, FaLandmark, FaBomb } from 'react-icons/fa';
import { RiResetLeftFill } from "react-icons/ri";
import { LiaBombSolid } from "react-icons/lia";
import incorrectSound from './assets/audio/incorrect.mp3';
import correctSound from './assets/audio/correct.mp3';

const categoryColors = {
  Geografia: "#2b44ff",
  Ciencia: "#4cd964",
  Deportes: "#ff9500",
  Entretenimiento: "#ff2d55",
  Arte: "#8e1d1d",
  Historia: "#ffcc00"
};

const categoryIcons = {
  Geografia: IoEarth,
  Ciencia: GiChemicalDropIcon,
  Deportes: GiSoccerBall,
  Entretenimiento: MdTheaterComedy,
  Arte: FaPaintBrush,
  Historia: FaLandmark
};

type Categoria = keyof typeof questionsData;

export default function App() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [preguntaActual, setPreguntaActual] = useState<any>(null);
  const [preguntasUsadas, setPreguntasUsadas] = useState<Set<string>>(new Set());
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [opcionesDescartadas, setOpcionesDescartadas] = useState<string[]>([]); // Nuevo estado para opciones descartadas

  const categorias = Object.keys(questionsData) as Categoria[];

  // Cargar preguntas usadas desde localStorage al iniciar
  useEffect(() => {
    const storedPreguntasUsadas = localStorage.getItem('preguntasUsadas');
    if (storedPreguntasUsadas) {
      setPreguntasUsadas(new Set(JSON.parse(storedPreguntasUsadas)));
    }
  }, []);

  // Guardar preguntas usadas en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('preguntasUsadas', JSON.stringify(Array.from(preguntasUsadas)));
  }, [preguntasUsadas]);

  const obtenerPreguntaAleatoria = () => {
    if (!categoriaSeleccionada) return;

    const preguntasCategoria = questionsData[categoriaSeleccionada];
    const preguntasDisponibles = preguntasCategoria.filter(
      p => !preguntasUsadas.has(p.pregunta)
    );

    if (preguntasDisponibles.length === 0) {
      alert('¡Ya no hay más preguntas disponibles en esta categoría!');
      return;
    }

    const preguntaRandom = preguntasDisponibles[
      Math.floor(Math.random() * preguntasDisponibles.length)
    ];

    setPreguntaActual(preguntaRandom);
    setPreguntasUsadas(prev => new Set(prev).add(preguntaRandom.pregunta));
    setOpcionesDescartadas([]); // Reiniciar opciones descartadas al obtener una nueva pregunta
  };

  const verificarRespuesta = (opcion: string) => {
    // Reproducir sonido según si la respuesta es correcta o incorrecta
    if (opcion === preguntaActual.respuestaCorrecta) {
      new Audio(correctSound).play();
    } else {
      new Audio(incorrectSound).play();
    }
    setRespuestaSeleccionada(opcion);
    setMostrarRespuesta(true);
  };

  const reiniciarJuego = () => {
    setPreguntasUsadas(new Set());
    setCategoriaSeleccionada(null);
    setPreguntaActual(null);
    localStorage.removeItem('preguntasUsadas');
  };

  const usarBomba = () => {
    if (!preguntaActual || mostrarRespuesta) return;

    // Filtrar las opciones incorrectas que no han sido descartadas
    const opcionesIncorrectas = preguntaActual.opciones.filter(
      (opcion: string) =>
        opcion !== preguntaActual.respuestaCorrecta &&
        !opcionesDescartadas.includes(opcion)
    );

    // Seleccionar 2 opciones incorrectas al azar
    const opcionesADescartar = opcionesIncorrectas
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    // Actualizar el estado de opciones descartadas
    setOpcionesDescartadas(prev => [...prev, ...opcionesADescartar]);
  };

  useEffect(() => {
    if (categoriaSeleccionada) {
      obtenerPreguntaAleatoria();
    }
  }, [categoriaSeleccionada]);

  return (
    <main className="container">
      <h1>Juego de Preguntas</h1>

      {!categoriaSeleccionada ? (
        <div className="categoria-selector">
          <h2>Selecciona una categoría:</h2>
          <div className="categorias">
            {categorias.map(categoria => (
              <button
                key={categoria}
                onClick={() => setCategoriaSeleccionada(categoria)}
                className="categoria-btn"
                style={{
                  backgroundColor: categoryColors[categoria as keyof typeof categoryColors],
                  color: 'white'
                }}
              >
                <span className="categoria-icon">{
                  categoryIcons[categoria]
                    ? React.createElement(categoryIcons[categoria] as React.ComponentType)
                    : null
                }</span>
                {categoria}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="juego">
          <h2>Categoría: {categoriaSeleccionada}</h2>
          {preguntaActual && (
            <div className="pregunta">
              <p>{preguntaActual.pregunta}</p>
              <div className="opciones">
                {preguntaActual.opciones.map((opcion: string) => {
                  const estaDescartada = opcionesDescartadas.includes(opcion);
                  return (
                    <button
                      key={opcion}
                      onClick={() => verificarRespuesta(opcion)}
                      className={`opcion-btn ${mostrarRespuesta && opcion === preguntaActual.respuestaCorrecta
                        ? 'correcta'
                        : mostrarRespuesta && opcion === respuestaSeleccionada
                          ? 'incorrecta'
                          : ''
                        } ${estaDescartada ? 'descartada' : ''}`}
                      disabled={mostrarRespuesta || estaDescartada}
                    >
                      {opcion}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="controles">
            <button
              onClick={() => {
                setMostrarRespuesta(false);
                setCategoriaSeleccionada(null);
              }}
            >
              {React.createElement(IoIosArrowBack as React.ComponentType)}

              Volver a Categorías
            </button>
            <button
              className='bomb-btn'
              onClick={usarBomba}
              disabled={mostrarRespuesta || opcionesDescartadas.length > 0}
            >
              {React.createElement(LiaBombSolid as React.ComponentType)}
              Bomba
            </button>
            <button
              onClick={reiniciarJuego}
            >
              {React.createElement(RiResetLeftFill as React.ComponentType)}
              Reiniciar Juego
            </button>
          </div>
        </div>
      )}
    </main>
  );
}